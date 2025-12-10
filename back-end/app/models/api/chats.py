from beanie import PydanticObjectId
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ChatIdRequest(BaseModel):
    id: PydanticObjectId


class BaseChatResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )
    
    id: PydanticObjectId
    chat_id: str = Field(None, alias="chatId")
    chat_name: Optional[str] = Field(alias="chatName")
    bot_id: PydanticObjectId = Field(alias="botId")
    bot_name: Optional[str] = Field(alias="botName")


class AllowedChatResponse(BaseChatResponse):
    approve_date: datetime = Field(alias="approveDate")


class ChatRequestResponse(BaseChatResponse):
    request_date: datetime = Field(alias="requestDate")


__all__ = [
    "ChatIdRequest",
    "AllowedChatResponse",
    "ChatRequestResponse",
]