from threading import Lock
from .models import EventItem

class EventsService:
    def __init__(self):
        self.clients = set()
        self.lock = Lock()

    def add_client(self, q, is_authenticated: bool):
        with self.lock:
            self.clients.add((q, is_authenticated))

    def remove_client(self, q):
        with self.lock:
            self.clients = {
                (cq, auth) for (cq, auth) in self.clients if cq != q
            }

    def _broadcast(self, event: EventItem):
        with self.lock:
            dead = []
            print(f"e: {event}, c: {self.clients}")
            for q, is_authenticated in self.clients:
                if event.private and not is_authenticated:
                    continue

                try:
                    q.put_nowait(event)
                except:
                    dead.append(q)

            if dead:
                self.clients = {
                    (cq, auth)
                    for (cq, auth) in self.clients
                    if cq not in dead
                }

    def broadcast_private(self, type: str, data: dict = None):
        evt = EventItem(
            type    = type,
            data    = data,
            private = True
        )
        self._broadcast(evt)

    def broadcast_public(self, type: str, data: dict = None):
        evt = EventItem(
            type    = type,
            data    = data,
            private = False
        )
        self._broadcast(evt)