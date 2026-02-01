from datetime import datetime, time
from pydantic import BaseModel


class DateValue(BaseModel):
    value: datetime

    @classmethod
    def from_string(cls, value: str) -> "DateValue":
        try:
            date = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return cls(value = date)
        except Exception as e:
            raise ValueError("Invalid datetime format") from e

    def to_mongo_query(self, field: str) -> dict:
        start_dt = datetime.combine(self.value.date(), time.min, tzinfo=self.value.tzinfo)
        end_dt = datetime.combine(self.value.date(), time.max, tzinfo=self.value.tzinfo)
        return {field: {"$gte": start_dt, "$lte": end_dt}}
