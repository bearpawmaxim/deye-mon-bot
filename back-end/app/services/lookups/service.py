from typing import List

from injector import inject

from shared.models.lookup import LookupValue
from app.repositories import ILookupsRepository


@inject
class LookupsService:
    def __init__(self, lookups: ILookupsRepository):
        self._lookups = lookups

    async def get_lookup_values(self, schema_name: str) -> List[LookupValue]:
        return await self._lookups.get_lookup_values(schema_name)
