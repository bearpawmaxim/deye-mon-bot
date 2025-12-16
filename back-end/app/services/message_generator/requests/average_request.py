from datetime import datetime, timedelta, timezone
from attr import dataclass
from injector import Injector

from ..models import NumericTemplateRequest
from app.repositories import IStationsDataRepository


@dataclass(frozen=True)
class AverageRequest(NumericTemplateRequest):
    station_id: int
    column: str
    start_date: datetime

    async def resolve(self, injector: Injector) -> float:
        stations_data = injector.get(IStationsDataRepository)
        now = datetime.now(timezone.utc)
        return await stations_data.get_station_data_average_column(
            start_date  = self.start_date,
            end_date    = now,
            station_id  = self.station_id,
            column_name = self.column,
        )


@dataclass(frozen=True)
class AverageMinutesRequest(NumericTemplateRequest):
    station_id: int
    column: str
    minutes: int

    async def resolve(self, injector: Injector) -> float:
        stations_data = injector.get(IStationsDataRepository)
        now = datetime.now(timezone.utc)
        return await stations_data.get_station_data_average_column(
            start_date  = now - timedelta(minutes=self.minutes),
            end_date    = now,
            station_id  = self.station_id,
            column_name = self.column,
        )