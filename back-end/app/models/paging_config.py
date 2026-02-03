from pydantic import BaseModel, Field


class PagingConfig(BaseModel):
    page: int
    page_size: int = Field(alias="pageSize")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }

class PagingInfo(PagingConfig):
    total: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }