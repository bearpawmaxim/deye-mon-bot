import json
import threading
from queue import Queue
from typing import Set

import redis
from .models import EventItem


class EventsService:
    REDIS_PUBLIC_CHANNEL = "sse_public"
    REDIS_PRIVATE_CHANNEL = "sse_private"

    def __init__(self, redis_url: str):
        # Redis connection
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)

        # Local queues for this node
        self._public_clients: Set[Queue] = set()
        self._private_clients: Set[Queue] = set()

        # Local lock for queue modification
        self._lock = threading.RLock()

        # Start Redis subscriber thread
        self._subscriber_thread = threading.Thread(target=self._redis_sub_loop, daemon=True)
        self._subscriber_thread.start()

    # ----- CLIENT MANAGEMENT -----

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

    # ----- BROADCASTING -----

    def broadcast_public(self, type: str, data: dict = None):
        evt = {"type": type, "data": data}
        # Anyone can publish, even jobs running in other nodes
        self.redis.publish(self.REDIS_PUBLIC_CHANNEL, json.dumps(evt))

    def broadcast_private(self, type: str, data: dict = None):
        evt = {"type": type, "data": data}
        self.redis.publish(self.REDIS_PRIVATE_CHANNEL, json.dumps(evt))

    # ----- REDIS → LOCAL QUEUE BROADCASTING -----

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

    def _redis_sub_loop(self):
        """
        Background thread that subscribes to Redis channels and
        pushes incoming events to local clients only.
        """
        pubsub = self.redis.pubsub()
        pubsub.subscribe(self.REDIS_PUBLIC_CHANNEL, self.REDIS_PRIVATE_CHANNEL)

        for message in pubsub.listen():
            if message["type"] != "message":
                continue

            channel = message["channel"]
            payload = json.loads(message["data"])

            event = EventItem(
                type=payload["type"],
                data=payload.get("data"),
            )

            if channel == self.REDIS_PUBLIC_CHANNEL:
                self._broadcast_to_local(self._public_clients, event)

            elif channel == self.REDIS_PRIVATE_CHANNEL:
                self._broadcast_to_local(self._private_clients, event)

    # ----- SHUTDOWN CLEANUP -----

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
