from odmantic import Field, Model, Reference
import datetime
from typing import Optional
from .bot import Bot


class AllowedChat(Model):
    chat_id: Optional[str] = None
    bot: Bot = Reference()
    approve_date: datetime = Field(default_factory=datetime.now(datetime.timezone.utc))

    class Config:
        collection = "allowed_chat"
