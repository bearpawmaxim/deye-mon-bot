from shared.services import EventsService

class BaseService:
    def __init__(self, events: EventsService):
        self._events = events

    def broadcast_private(self, type: str, data: dict = None):
        self._events.broadcast_private(type, data)

    def broadcast_public(self, type: str, data: dict = None):
        self._events.broadcast_public(type, data)