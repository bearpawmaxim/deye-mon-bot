import asyncio
from datetime import datetime, timezone
from typing import List
import io
from contextlib import redirect_stdout
from beanie import PydanticObjectId
from injector import inject

from app.repositories import IBotsRepository, IChatsRepository, IMessagesRepository, IStationsDataRepository
from app.services.telegram.service import TelegramService
from app.models.api import BotResponse, CreateBotRequest, UpdateBotRequest
from shared.models import Message
from shared.models.bot import Bot
from shared.services import EventsService
from app.services import MessageGeneratorService
from app.services.base import BaseService


@inject
class BotsService(BaseService):

    def __init__(
        self,
        telegram: TelegramService,
        messages: IMessagesRepository,
        bots: IBotsRepository,
        chats: IChatsRepository,
        stations_data: IStationsDataRepository,
        events: EventsService,
        message_generator: MessageGeneratorService,
    ):
        super().__init__(events)
        self._telegram = telegram
        self._messages = messages
        self._bots = bots
        self._chats = chats
        self._stations_data = stations_data
        self._message_generator = message_generator


    async def get_enabled_bots(self) -> List[Bot]:
        return await self._bots.get_bots(False)


    async def get_bots(self) -> List[BotResponse]:
        bots = await self._bots.get_bots(True)

        async def process_bot(bot: Bot):
            bot_name = "Invalid bot token"
            try:
                bot_name = (await self._telegram.get_bot_info(bot.id)).username
            except Exception as e:
                print(f"Cannot get bot info for bot {bot.id}: {str(e)}")
            return BotResponse(
                id           = bot.id,
                name         = bot_name,
                token        = bot.token,
                enabled      = bot.enabled,
                hook_enabled = bot.hook_enabled,
            )

        tasks = [
            asyncio.create_task(process_bot(bot))
            for bot in bots
        ]

        return await asyncio.gather(*tasks)


    async def get_bot(self, bot_id: PydanticObjectId) -> Bot:
        return await self._bots.get_bot(bot_id)


    async def create_bot(self, dto: CreateBotRequest):
        print(dto.model_dump())
        bot = await self._bots.create_bot(dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        return bot


    async def update_bot(self, bot_id: PydanticObjectId, dto: UpdateBotRequest):
        bot = await self._bots.update_bot(bot_id, dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        else:
            await self._telegram.remove_bot(bot.id)

        return bot


    async def update(self, bot_id: PydanticObjectId, message):
        if 'message' in message:
            chat_id = message["message"]["chat"]["id"]
            if not (await self._bots.get_is_hook_enabled(bot_id)):
                print(f'hook processing is disabled for bot {bot_id}')
                return
            if (await self._chats.get_is_chat_allowed(chat_id, bot_id)):
                text = message['message']['text']
                await self._telegram.send_message(bot_id, chat_id, f"pong '{text}'")
            else:
                await self._chats.add_chat_request(chat_id, bot_id)
                self.broadcast_private("chats_updated")
                print(f'request from not allowed chat {chat_id}')

    async def _send_message(self, message, message_content):
        try:
            await self._telegram.send_message(message.bot.id, message.channel_id, message_content)
            await self._messages.set_last_sent(message.id)
            message.last_sent_time = datetime.now(timezone.utc)
        except Exception as e:
            print(f"Error sending message: {e}")


    async def periodic_send(self):
        messages = await self._messages.get_messages()

        for message in messages:
            try:
                info = await self._message_generator.generate_message(message)
                if info is None:
                    continue
                if info.should_send and info.next_send_time <= datetime.now(timezone.utc):
                    await self._send_message(info, info.message)
            except Exception as e:
                print(f"Error sending message '{message.name}': {e}")


    async def get_message(self, message: Message):
        stdout_buffer = io.StringIO()

        info = None
        with redirect_stdout(stdout_buffer):
            info = await self._message_generator.generate_message(message, True, True)

        if info is None:
            captured_output = stdout_buffer.getvalue()
            raise Exception(captured_output)

        return info
