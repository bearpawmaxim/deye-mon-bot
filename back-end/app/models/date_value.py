from datetime import datetime, time
from pydantic_core import core_schema


class DateValue:
    def __init__(self, value: datetime):
        self.value = value

    def __repr__(self) -> str:
        return f"DateValue({self.value!r})"

    @classmethod
    def _parse(cls, value: str) -> "DateValue":
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except Exception as e:
            raise ValueError("Invalid datetime format") from e

        return cls(dt)

    @classmethod
    def __get_pydantic_core_schema__(cls, _source, _handler):
        return core_schema.no_info_plain_validator_function(cls._parse)
    
    def to_mongo_query(self, field: str) -> dict:
        start_dt = datetime.combine(self.value.date(), time.min, tzinfo=self.value.tzinfo)
        end_dt = datetime.combine(self.value.date(), time.max, tzinfo=self.value.tzinfo)
        return {field: {"$gte": start_dt, "$lte": end_dt}}
