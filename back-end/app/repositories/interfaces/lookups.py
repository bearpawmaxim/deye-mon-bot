from abc import ABC, abstractmethod
from typing import List, Type

from shared.models.beanie_filter import BeanieFilter
from shared.models.lookup import LookupModel, LookupValue


class LookupDefinition:
    filters: BeanieFilter
    model: Type[LookupModel]

    def __init__(self, filters: BeanieFilter, model: Type[LookupModel]):
        self.filters = filters
        self.model = model


class ILookupsRepository(ABC):

    @abstractmethod
    async def get_lookup_values(self, schema_name: str) -> List[LookupValue]:
        ...