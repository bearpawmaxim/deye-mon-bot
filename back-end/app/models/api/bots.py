from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class UpdateBotRequest(BaseModel):
    enabled: bool = Field()
    hook_enabled: bool = Field(alias="hookEnabled")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class CreateBotRequest(UpdateBotRequest):
    token: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class BotResponse(BaseModel):
    id: PydanticObjectId
    name: str
    token: str
    enabled: bool
    hook_enabled: bool = Field(alias="hookEnabled")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


__all__ = [
    "CreateBotRequest",
    "UpdateBotRequest",
    "BotResponse"
]