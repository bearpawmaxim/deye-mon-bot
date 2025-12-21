from shared.services import EventsService

class BaseService:
    def __init__(self, events: EventsService):
        self._events = events

    async def broadcast_private(self, type: str, data: dict = None):
        await self._events.broadcast_private(type, data)

    async def broadcast_public(self, type: str, data: dict = None):
        await self._events.broadcast_public(type, data)
