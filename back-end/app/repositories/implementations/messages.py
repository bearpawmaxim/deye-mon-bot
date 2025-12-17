from datetime import datetime, timezone
from typing import List

from beanie import PydanticObjectId

from shared.models.bot import Bot
from shared.models.station import Station

from ..interfaces.messages import IMessagesRepository
from shared.models.message import Message


class MessagesRepository(IMessagesRepository):
    async def _get_message(self, message_id: PydanticObjectId, with_links: bool) -> Message:
        return await Message.find_one(Message.id == message_id, fetch_links=True)

    async def get_messages(self, all: bool = False) -> List[Message]:
        query = {} if all else {"enabled": True}
        return await Message.find(query, fetch_links=True).to_list()

    async def get_message(self, message_id: PydanticObjectId) -> Message:
        return await self._get_message(message_id, True)
    
    async def save_state(self, message_id: PydanticObjectId, state: bool):
        message = await self._get_message(message_id, False)
        if message:
            message.enabled = state
            await message.save()

    async def create(self, data: dict) -> Message:
        message = Message()
        for key, value in data.items():
            if key == "bot_id":
                key = "bot"
                value = await Bot.get(value)
            if key == "stations":
                value = [await Station.get(station_id) for station_id in value]

            if hasattr(message, key):
                setattr(message, key, value)
            else:
                print(f"No attr {key} in Message")

        return await message.insert()

    async def update(self, message_id: PydanticObjectId, data: dict) -> Message:
        message = await Message.get(message_id)
        if not message:
            return None
        for key, value in data.items():
            if key == "bot_id":
                key = "bot"
                value = await Bot.get(value)
            if key == "stations":
                value = [await Station.get(station_id) for station_id in value]

            if hasattr(message, key):
                setattr(message, key, value)
            else:
                print(f"No attr {key} in Message")
        await message.save()
        return message

    async def set_last_sent(self, message_id: PydanticObjectId):
        message = await Message.get(message_id)
        if not message:
            return
        message.last_sent_time = datetime.now(timezone.utc)
        await message.save()
