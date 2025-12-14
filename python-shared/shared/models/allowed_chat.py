from datetime import datetime, timezone
from typing import Optional
from pydantic import Field
from shared.models.bot import Bot
from beanie import Document, Link


class AllowedChat(Document):
    chat_id: Optional[str] = None
    bot: Link[Bot]
    approve_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "allowed_chats"