from datetime import datetime, timezone
from typing import List

from beanie import PydanticObjectId

from shared.models.bot import Bot

from ..interfaces.chats import IChatsRepository
from shared.models.allowed_chat import AllowedChat
from shared.models.chat_request import ChatRequest


class ChatsRepository(IChatsRepository):

    async def get_chat_requests(self) -> List[ChatRequest]:
        return await ChatRequest.find(fetch_links=True).to_list()

    async def get_allowed_chats(self) -> List[AllowedChat]:
        return await AllowedChat.find(fetch_links=True).to_list()

    async def get_is_chat_allowed(self, chat_id: str, bot_id: PydanticObjectId) -> bool:
        chat = await AllowedChat.find_one(
            AllowedChat.chat_id == chat_id,
            AllowedChat.bot.id == bot_id,
            fetch_links=True,
        )
        return chat is not None

    async def add_chat_request(self, chat_id: str, bot_id: PydanticObjectId):
        existing_request = await ChatRequest.find_one(
            AllowedChat.chat_id == chat_id,
            AllowedChat.bot.id == bot_id,
        )
        if existing_request is None:
            bot = await Bot.get(bot_id)
            request = ChatRequest(
                chat_id      = chat_id,
                bot       = bot,
                request_date = datetime.now(timezone.utc),
            )
            await request.insert()

    async def approve_chat_request(self, id: PydanticObjectId):
        request = await ChatRequest.get(id)
        if request is None:
            return
        allowed = AllowedChat(
            chat_id      = request.chat_id,
            bot          = request.bot,
            approve_date = datetime.now(timezone.utc),
        )
        await allowed.insert()
        await request.delete()

    async def reject_chat_request(self, id: PydanticObjectId):
        request = await ChatRequest.get(id)
        if request is None:
            return
        await request.delete()

    async def disallow_chat(self, id: PydanticObjectId):
        chat = await AllowedChat.get(id)
        if chat is None:
            return
        request = ChatRequest(
            bot          = chat.bot,
            chat_id      = chat.chat_id,
            request_date = datetime.now(timezone.utc),
        )
        await chat.delete()
        await request.insert()
        
