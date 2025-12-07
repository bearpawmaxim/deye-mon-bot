from typing import Optional
from datetime import datetime
from beanie import Document


class User(Document):
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
    async def get_lookup_values(cls):
        users = await cls.find_all().to_list()
        return [{"value": str(u.id), "text": u.name} for u in users]
