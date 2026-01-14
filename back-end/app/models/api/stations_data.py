from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class StationsDataRequest(BaseModel):
    last_seconds: Optional[int] = Field(None, alias="lastSeconds")
    start_date: Optional[datetime] = Field(None, alias="startDate")
    end_date: Optional[datetime] = Field(None, alias="endDate")
    records_count: Optional[int] = Field(250, alias="recordsCount")

    @model_validator(mode="after")
    def validate_time_range(self):
        has_last_seconds = self.last_seconds is not None
        has_range = self.start_date is not None or self.end_date is not None

        if has_last_seconds and has_range:
            raise ValueError(
                "Provide either lastSeconds OR startDate + endDate, not both"
            )

        if has_range:
            if self.start_date is None or self.end_date is None:
                raise ValueError(
                    "Both startDate and endDate must be provided together"
                )

            if self.start_date >= self.end_date:
                raise ValueError(
                    "startDate must be earlier than endDate"
                )

        if not has_last_seconds and not has_range:
            raise ValueError(
                "You must provide either lastSeconds OR startDate + endDate"
            )

        return self

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


__all__ = [
    "StationsDataRequest",
]
