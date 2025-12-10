from abc import ABC, abstractmethod
from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.allowed_chat import AllowedChat
from shared.models.beanie.chat_request import ChatRequest


class IChatsRepository(ABC):

    @abstractmethod
    async def get_chat_requests(self) -> List[ChatRequest]:
        ...

    @abstractmethod
    async def get_allowed_chats(self) -> List[AllowedChat]:
        ...

    @abstractmethod
    async def get_is_chat_allowed(self, chat_id: str, bot_id: PydanticObjectId) -> bool:
        ...

    @abstractmethod
    async def add_chat_request(self, chat_id: str, bot_id: PydanticObjectId):
        ...

    @abstractmethod
    async def approve_chat_request(self, id: PydanticObjectId):
        ...

    @abstractmethod
    async def reject_chat_request(self, id: PydanticObjectId):
        ...

    @abstractmethod
    async def disallow_chat(self, id: PydanticObjectId):
        ...