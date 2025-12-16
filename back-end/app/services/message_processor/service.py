from datetime import datetime, timezone
from beanie import PydanticObjectId
from injector import inject

from app.repositories import IBotsRepository, IChatsRepository, IMessagesRepository
from ..interfaces import IMessageGeneratorService
from ..telegram import TelegramService
from shared.services.events.service import EventsService
from ..base import BaseService


@inject
class MessageProcessorService(BaseService):
    def __init__(
        self,
        events: EventsService,
        message_generator: IMessageGeneratorService,
        telegram: TelegramService,
        bots: IBotsRepository,
        chats: IChatsRepository,
        messages: IMessagesRepository,
    ):
        super().__init__(events)
        self._message_generator = message_generator
        self._telegram = telegram
        self._bots = bots
        self._chats = chats
        self._messages = messages

    
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
                    await self._send_message(message, info.message)
            except Exception as e:
                print(f"Error sending message '{message.name}': {e}")


    async def handle_incoming_message(self, bot_id: PydanticObjectId, message):
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
