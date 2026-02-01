
from typing import Literal, Union
from beanie import PydanticObjectId
from pydantic import BaseModel, Field, field_validator

from .column_data_type import ColumnDataType
from .date_range_value import DateRangeValue
from .date_value import DateValue


class BaseFilter(BaseModel):
    column: str
    data_type: ColumnDataType = Field(alias="dataType")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class DateTimeFilter(BaseFilter):
    data_type: Literal[ColumnDataType.DateTime] = Field(alias="dataType")
    value: DateValue | DateRangeValue

    @field_validator("value", mode="before")
    @classmethod
    def parse_datetime_value(cls, v):
        if isinstance(v, (DateValue, DateRangeValue)):
            return v

        if isinstance(v, str):
            if "," in v:
                return DateRangeValue.from_string(v)
            return DateValue.from_string(v)

        raise TypeError("Invalid DateTime filter value")


class PrimitiveFilter(BaseFilter):
    data_type: Literal[
        ColumnDataType.Boolean,
        ColumnDataType.Number,
        ColumnDataType.Text,
    ] = Field(alias="dataType")
    value: bool | int | float | str


class ObjectIdFilter(BaseFilter):
    data_type: Literal[ColumnDataType.Id] = Field(alias="dataType")
    value: PydanticObjectId


FilterConfig = Union[
    DateTimeFilter,
    PrimitiveFilter,
    ObjectIdFilter,
]
