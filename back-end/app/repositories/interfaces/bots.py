from abc import ABC, abstractmethod
from typing import List
from beanie import PydanticObjectId

from shared.models.beanie.bot import Bot


class IBotsRepository(ABC):

    @abstractmethod
    async def get_bots(self, all: bool) -> List[Bot]:
        ...

    @abstractmethod
    async def get_bot(self, bot_id: PydanticObjectId) -> Bot:
        ...

    @abstractmethod
    async def create_bot(self, data: dict) -> Bot:
        ...

    @abstractmethod
    async def update_bot(self, bot_id: PydanticObjectId, data: dict) -> Bot:
        ...
