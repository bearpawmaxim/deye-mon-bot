from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from .bot import Bot


class ChatRequest(Document):
    chat_id: Optional[str] = None
    bot: Link[Bot]
    request_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chat_requests"