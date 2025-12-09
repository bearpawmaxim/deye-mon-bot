from datetime import datetime
from typing import List, Any, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class MessageListResponseModel(BaseModel):
    id: PydanticObjectId
    name: str
    channel_name: str = Field(alias="channelName")
    stations: List[PydanticObjectId]
    bot_name: str = Field(alias="botName")
    last_sent_time: Optional[datetime] = Field(None, alias="lastSentTime")
    enabled: bool

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class MessageEditResponseModel(BaseModel):
    id: PydanticObjectId
    name: str
    channel_id: str = Field(alias="channelId")
    channel_name: str = Field(alias="channelName")
    stations: List[PydanticObjectId]
    bot_id: PydanticObjectId = Field(alias="botId")
    bot_name: str = Field(alias="botName")
    last_sent_time: Optional[datetime] = Field(None, alias="lastSentTime")
    message_template: str = Field(alias="messageTemplate")
    should_send_template: str = Field(alias="shouldSendTemplate")
    timeout_template: str = Field(alias="timeoutTemplate")
    enabled: bool

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class MessageCreateRequest(BaseModel):
    name: str
    channel_id: str = Field(alias="channelId")
    stations: List[PydanticObjectId]
    bot_id: PydanticObjectId = Field(alias="botId")
    message_template: str = Field(alias="messageTemplate")
    should_send_template: str = Field(alias="shouldSendTemplate")
    timeout_template: str = Field(alias="timeoutTemplate")
    enabled: bool

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class MessageUpdateRequest(MessageCreateRequest):
    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


__all__ = [
    "MessageListResponseModel",
    "MessageEditResponseModel",
    "MessageCreateRequest",
    "MessageUpdateRequest",
]
