from odmantic import Model
from typing import Optional
from datetime import datetime


class User(Model):
    name: str
    password: str
    is_active: bool = True
    is_reporter: bool = False
    api_key: Optional[str] = None
    password_reset_token: Optional[str] = None
    reset_token_expiration: Optional[datetime] = None

    def __str__(self):
        return f"User(id={self.id}, name='{self.name}', password='***', is_active={self.is_active})"

    @classmethod
    async def get_lookup_values(cls, engine):
        users = await engine.find(cls)
        return [{'value': u.id, 'text': u.name} for u in users]

    class Config:
        collection = "users"
