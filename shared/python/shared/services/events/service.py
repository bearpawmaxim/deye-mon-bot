from typing import Set
import asyncio

from .models import EventItem, EventsServiceConfig
from .events_transport import EventsTransport, LocalTransport
from .redis_transport import RedisTransport
from ...bounded_queue import BoundedQueue


class EventsService:
    REDIS_PUBLIC_CHANNEL = "sse_public"
    REDIS_PRIVATE_CHANNEL = "sse_private"

    def __init__(self, config: EventsServiceConfig):
        if config.is_debug:
            self.transport: EventsTransport = LocalTransport()
        else:
            self.transport: EventsTransport = RedisTransport(
                config.redis_uri,
                self.REDIS_PUBLIC_CHANNEL,
                self.REDIS_PRIVATE_CHANNEL,
            )

        self._public_clients: Set[BoundedQueue] = set()
        self._private_clients: Set[BoundedQueue] = set()
        self._subscriber_task: asyncio.Task | None = None

    async def start(self):
        if self._subscriber_task:
            return

        self._subscriber_task = asyncio.create_task(
            self.transport.start_subscriber(self._handle_incoming_event)
        )

    async def shutdown(self):
        if hasattr(self.transport, "stop"):
            await self.transport.stop()
        await self.cleanup_all()

    def add_public_client(self, q: BoundedQueue):
        self._public_clients.add(q)

    def add_private_client(self, q: BoundedQueue):
        self._private_clients.add(q)

    def remove_client(self, q: BoundedQueue):
        self._public_clients.discard(q)
        self._private_clients.discard(q)

    async def broadcast_public(self, type: str, data: dict = None):
        evt = EventItem(type, data, False)
        await self.transport.publish(self.REDIS_PUBLIC_CHANNEL, evt)

    async def broadcast_private(self, type: str, data: dict = None):
        evt = EventItem(type, data, True)
        await self.transport.publish(self.REDIS_PRIVATE_CHANNEL, evt)

    async def _broadcast_to_local(self, clients: Set[BoundedQueue], event: EventItem):
        dead = set()
        for q in clients:
            try:
                q.put_nowait(event)
            except Exception:
                dead.add(q)

        for q in dead:
            clients.discard(q)


    async def _handle_incoming_event(self, channel: str, event: EventItem):
        if channel == self.REDIS_PUBLIC_CHANNEL:
            await self._broadcast_to_local(self._public_clients, event)
        elif channel == self.REDIS_PRIVATE_CHANNEL:
            await self._broadcast_to_local(self._private_clients, event)


    async def cleanup_all(self):
        for clients in (self._public_clients, self._private_clients):
            dead = set()
            for q in clients:
                try:
                    q.put_nowait(None)
                except:
                    dead.add(q)
            for q in dead:
                clients.discard(q)
