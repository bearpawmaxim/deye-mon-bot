from typing import List, Optional
from datetime import datetime
from beanie import Document

from .beanie_filter import BeanieFilter
from .lookup import LookupModel, LookupValue


class User(Document, LookupModel):
    name: str
    password: Optional[str]
    is_active: bool = True
    is_reporter: bool = False
    api_key: Optional[str] = None
    password_reset_token: Optional[str] = None
    reset_token_expiration: Optional[datetime] = None

    class Settings:
        name = "users"

    def __str__(self):
        return (
            f"User(id={self.id}, name='{self.name}', "
            f"password='***', is_active={self.is_active})"
        )

    @classmethod
    async def get_lookup_values(self, filter: BeanieFilter) -> List[LookupValue]:
        users = await self.find(filter).to_list()
        return [LookupValue(
            value = u.id,
            text  = u.name
        ) for u in users]

