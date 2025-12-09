from abc import ABC, abstractmethod
from typing import List
from beanie import PydanticObjectId
from pydantic import BaseModel

from .beanie_filter import BeanieFilter


class LookupValue(BaseModel):
    value: PydanticObjectId
    text: str


class LookupModel(ABC):

    @abstractmethod
    async def get_lookup_values(self, filter: BeanieFilter) -> List[LookupValue]:
        ...