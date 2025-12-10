import asyncio
from typing import List

from beanie import PydanticObjectId
from injector import inject
from app.models.api import (
    MessageListResponseModel,
    MessageEditResponseModel,
    MessageCreateRequest,
    MessageUpdateRequest,
)
from app.repositories import IMessagesRepository
from shared.models.beanie.message import Message
from shared.services.events.service import EventsService
from ..telegram import TelegramService
from ..base import BaseService


@inject
class MessagesService(BaseService):
    def __init__(
        self,
        events: EventsService,
        messages: IMessagesRepository,
        telegram: TelegramService,
    ):
        super().__init__(events)
        self._messages = messages
        self._telegram = telegram


    async def _get_bot_name(self, bot_id: str):
        try:
            bot_info = await self._telegram.get_bot_info(bot_id)
            return bot_info.username
        except:
            print(f'Cannot get bot info for bot {bot_id}')
            return 'Invalid bot identifier'


    async def _get_channel_name(self, channel_id: str, bot_id: str):
        try:
            chat_info = await self._telegram.get_chat_info(channel_id, bot_id)
            return chat_info.title
        except:
            print(f'Cannot get channel info for channel {channel_id}')
            return 'Invalid channel identifier'


    async def _process_message(self, message):
        bot_name = await self._get_bot_name(message.bot.id)
        channel_name = await self._get_channel_name(message.channel_id, message.bot.id)
        stations = [station.id for station in message.stations]
        return MessageListResponseModel(
            id             = message.id,
            name           = message.name,
            channel_name   = channel_name,
            stations       = stations,
            bot_name       = bot_name,
            last_sent_time = message.last_sent_time,
            enabled        = message.enabled,
        )


    async def get_messages(self, all: bool = False) -> List[MessageListResponseModel]:
        messages = await self._messages.get_messages(all)

        tasks = [
            asyncio.create_task(self._process_message(message))
            for message in messages
        ]

        return await asyncio.gather(*tasks)


    async def get_message(self, message_id: PydanticObjectId) -> MessageEditResponseModel:
        message = await self._messages.get_message(message_id)

        bot_name = await self._get_bot_name(message.bot.id)
        channel_name = await self._get_channel_name(message.channel_id, message.bot.id)
        stations = [station.id for station in message.stations]
        return MessageEditResponseModel(
            id                   = message.id,
            name                 = message.name,
            bot_id               = message.bot.id,
            should_send_template = message.should_send_template,
            timeout_template     = message.timeout_template,
            message_template     = message.message_template,
            enabled              = message.enabled,
            stations             = stations,
            last_sent_time       = message.last_sent_time,
            bot_name             = bot_name,
            channel_name         = channel_name,
            channel_id           = message.channel_id
        )


    async def save_state(self, message_id: PydanticObjectId, state: bool):
        await self._messages.save_state(message_id, state)
        self.broadcast_private("messages_updated")


    async def create_message(self, dto: MessageCreateRequest):
        message = await self._messages.create(dto.model_dump())
        self.broadcast_private("messages_updated")
        return message.id


    async def update_message(self, id: PydanticObjectId, dto: MessageUpdateRequest):
        message = await self._messages.update(id, dto.model_dump())
        self.broadcast_private("messages_updated")
        return message.id
