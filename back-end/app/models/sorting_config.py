from typing import Literal
from pydantic import BaseModel


class SortingConfig(BaseModel):
    column: str
    order: Literal["asc", "desc"]

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
