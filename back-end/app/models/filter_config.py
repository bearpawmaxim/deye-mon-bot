
from typing import Any
from pydantic import BaseModel, Field

from .column_data_type import ColumnDataType


class FilterConfig(BaseModel):
    column: str
    data_type: ColumnDataType = Field(alias="dataType")
    value: Any

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
