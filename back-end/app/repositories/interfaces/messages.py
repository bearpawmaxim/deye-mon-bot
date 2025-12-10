from abc import ABC, abstractmethod
from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.message import Message


class IMessagesRepository(ABC):

    @abstractmethod
    async def get_messages(self, all: bool = False) -> List[Message]:
        ...

    @abstractmethod
    async def get_message(self, message_id: PydanticObjectId) -> Message:
        ...

    @abstractmethod
    async def save_state(self, message_id: PydanticObjectId, state: bool):
        ...

    @abstractmethod
    async def create(self, data: dict) -> Message:
        ...

    @abstractmethod
    async def update(self, message_id: PydanticObjectId, data: dict) -> Message:
        ...

    @abstractmethod
    async def set_last_sent(self, message_id: PydanticObjectId):
        ...