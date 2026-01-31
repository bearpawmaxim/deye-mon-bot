from datetime import datetime, time

from pydantic import BaseModel
from pydantic_core import core_schema


class DateRangeValue(BaseModel):
    def __init__(self, start: datetime, end: datetime):
        self.start = start
        self.end = end

    def __repr__(self) -> str:
        return f"DateRangeValue(start={self.start!r}, end={self.end!r})"

    @classmethod
    def _parse(cls, value: str) -> "DateRangeValue":
        try:
            start_str, end_str = [v.strip() for v in value.split(",")]
            start = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
            end = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
        except Exception as e:
            raise ValueError("Invalid date range format") from e

        return cls(start=start, end=end)

    @classmethod
    def __get_pydantic_core_schema__(cls, _source, _handler):
        return core_schema.no_info_plain_validator_function(cls._parse)
    
    def to_mongo_query(self, field: str) -> dict:
        start_dt = datetime.combine(self.start.date(), time.min, tzinfo=self.start.tzinfo)
        end_dt = datetime.combine(self.end.date(), time.max, tzinfo=self.end.tzinfo)
        return {field: {"$gte": start_dt, "$lte": end_dt}}

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
