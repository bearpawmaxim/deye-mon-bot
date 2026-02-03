from datetime import datetime, time
from pydantic import BaseModel

class DateRangeValue(BaseModel):
    start: datetime
    end: datetime

    @classmethod
    def from_string(cls, value: str) -> "DateRangeValue":
        try:
            start_str, end_str = [v.strip() for v in value.split(",")]
            return cls(
                start=datetime.fromisoformat(start_str.replace("Z", "+00:00")),
                end=datetime.fromisoformat(end_str.replace("Z", "+00:00")),
            )
        except Exception as e:
            raise ValueError("Invalid date range format") from e

    def to_mongo_query(self, field: str) -> dict:
        start_dt = datetime.combine(self.start.date(), time.min, tzinfo=self.start.tzinfo)
        end_dt = datetime.combine(self.end.date(), time.max, tzinfo=self.end.tzinfo)
        return {field: {"$gte": start_dt, "$lte": end_dt}}
