import threading
from queue import Queue
from typing import Set

from .models import EventItem, EventsServiceConfig
from .events_transport import EventsTransport, RedisTransport, LocalTransport


class EventsService:
    REDIS_PUBLIC_CHANNEL = "sse_public"
    REDIS_PRIVATE_CHANNEL = "sse_private"

    def __init__(self, config: EventsServiceConfig):
        print(config)

        if config.is_debug:
            self.transport: EventsTransport = LocalTransport()
        else:
            self.transport: EventsTransport = RedisTransport(
                config.redis_url,
                self.REDIS_PUBLIC_CHANNEL,
                self.REDIS_PRIVATE_CHANNEL
            )

        self._public_clients: Set[Queue] = set()
        self._private_clients: Set[Queue] = set()
        self._lock = threading.RLock()

        self.transport.start_subscriber(self._handle_incoming_event)

    def add_public_client(self, q: Queue):
        with self._lock:
            self._public_clients.add(q)

    def add_private_client(self, q: Queue):
        with self._lock:
            self._private_clients.add(q)

    def remove_client(self, q: Queue):
        with self._lock:
            self._public_clients.discard(q)
            self._private_clients.discard(q)

    def broadcast_public(self, type: str, data: dict = None):
        evt = EventItem(type, data, False)
        self.transport.publish(self.REDIS_PUBLIC_CHANNEL, evt)

    def broadcast_private(self, type: str, data: dict = None):
        evt = EventItem(type, data, True)
        self.transport.publish(self.REDIS_PRIVATE_CHANNEL, evt)

    def _broadcast_to_local(self, clients: Set[Queue], event: EventItem):
        dead = set()
        with self._lock:
            for q in clients:
                try:
                    q.put_nowait(event)
                except:
                    dead.add(q)

            for q in dead:
                clients.discard(q)

    def _handle_incoming_event(self, channel: str, event: EventItem):
        if channel == self.REDIS_PUBLIC_CHANNEL:
            self._broadcast_to_local(self._public_clients, event)
        elif channel == self.REDIS_PRIVATE_CHANNEL:
            self._broadcast_to_local(self._private_clients, event)

    def cleanup_all(self):
        with self._lock:
            for clients in (self._public_clients, self._private_clients):
                dead = set()
                for q in clients:
                    try:
                        q.put_nowait(None)
                    except:
                        dead.add(q)
                for q in dead:
                    clients.discard(q)
