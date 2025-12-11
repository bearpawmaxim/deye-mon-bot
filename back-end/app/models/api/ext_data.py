from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class GridPowerState(BaseModel):
    state: bool

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class GridPowerRequest(BaseModel):
    grid_power: GridPowerState

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class ExtDataCreateRequest(BaseModel):
    user_id: PydanticObjectId
    grid_state: bool
    received_at: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class ExtDataResponse(BaseModel):
    id: PydanticObjectId
    user_id: PydanticObjectId = Field(alias="userId")
    grid_state: bool = Field(alias="gridState")
    received_at: datetime = Field(alias="receivedAt")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


__all__ = [
    "GridPowerState",
    "GridPowerRequest",
    "ExtDataCreateRequest",
    "ExtDataResponse"
]