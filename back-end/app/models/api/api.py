from typing import Annotated, Generic, TypeVar
from pydantic import BaseModel, Field

from ..paging_config import PagingConfig, PagingInfo
from ..filter_config import FilterConfig
from ..sorting_config import SortingConfig


class PageableRequest(BaseModel):
    paging: PagingConfig

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class SortableRequest(BaseModel):
    sorting: SortingConfig

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class FilterableRequest(BaseModel):
    filters: list[
        Annotated[
            FilterConfig,
            Field(discriminator="data_type"),
        ]
    ]

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


T = TypeVar("T")

class PageableResponse(BaseModel, Generic[T]):
    data: list[T]
    paging: PagingInfo

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }

__all__ = [
    "PageableRequest",
    "SortableRequest",
    "FilterableRequest",
    "PageableResponse",
]