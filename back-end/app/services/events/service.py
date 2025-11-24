from threading import RLock
from queue import Queue
from typing import Set, Tuple
from .models import EventItem

Client = Tuple[Queue, bool]

class EventsService:
    def __init__(self):
        self._clients: Set[Client] = set()
        self._lock = RLock()

    def add_client(self, q: Queue, is_authenticated: bool):
        with self._lock:
            self._clients.add((q, is_authenticated))

    def remove_client(self, q: Queue):
        with self._lock:
            self._clients = {(cq, auth) for (cq, auth) in self._clients if cq != q}

    def _broadcast(self, event: EventItem):
        dead_clients: Set[Queue] = set()

        with self._lock:
            for q, is_authenticated in self._clients:
                if event.private and not is_authenticated:
                    continue
                try:
                    q.put_nowait(event)
                except Exception:
                    dead_clients.add(q)

            if dead_clients:
                self._clients = {
                    (cq, auth) for (cq, auth) in self._clients if cq not in dead_clients
                }

    def broadcast_public(self, type: str, data: dict = None):
        evt = EventItem(type=type, data=data, private=False)
        self._broadcast(evt)

    def broadcast_private(self, type: str, data: dict = None):
        evt = EventItem(type=type, data=data, private=True)
        self._broadcast(evt)

    def cleanup_dead_clients(self):
        dead_clients: Set[Queue] = set()
        with self._lock:
            for q, _ in self._clients:
                try:
                    q.put_nowait(None)
                except Exception:
                    dead_clients.add(q)
            if dead_clients:
                self._clients = {(cq, auth) for (cq, auth) in self._clients if cq not in dead_clients}
