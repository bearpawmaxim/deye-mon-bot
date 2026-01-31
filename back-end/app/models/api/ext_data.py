from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field

from .api import FilterableRequest, PageableRequest, PageableResponse, SortableRequest


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


class ExtDataItemResponse(BaseModel):
    id: PydanticObjectId
    user_id: PydanticObjectId = Field(alias="userId")
    grid_state: bool = Field(alias="gridState")
    received_at: datetime = Field(alias="receivedAt")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }

class ExtDataListRequest(PageableRequest, SortableRequest, FilterableRequest):
    pass

class ExtDataListResponse(PageableResponse[ExtDataItemResponse]):
    pass

__all__ = [
    "GridPowerState",
    "GridPowerRequest",
    "ExtDataCreateRequest",
    "ExtDataItemResponse",
    "ExtDataListRequest",
    "ExtDataListResponse",
]