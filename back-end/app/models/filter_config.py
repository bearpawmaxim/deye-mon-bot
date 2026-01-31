
from typing import Any
from beanie import PydanticObjectId
from pydantic import BaseModel, Field

from .column_data_type import ColumnDataType
from .date_range_value import DateRangeValue
from .date_value import DateValue


class FilterConfig(BaseModel):
    column: str
    data_type: ColumnDataType = Field(alias="dataType")
    value: (
        PydanticObjectId
        | DateRangeValue
        | DateValue
        | bool
        | int
        | float
        | str
    )

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
