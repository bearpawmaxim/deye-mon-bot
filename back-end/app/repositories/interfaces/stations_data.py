from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from beanie import PydanticObjectId

from shared.models import Station, StationData
from app.models import AssumedStationStatus, StationStatisticData
from app.models.deye import DeyeStationData


class IStationsDataRepository(ABC):

    @abstractmethod
    async def add_station_data(self, station: Station, station_data: DeyeStationData):
        ...

    @abstractmethod
    async def get_full_station_data(self, station_id: str, last_seconds: int) -> List[StationData]:
        ...

    @abstractmethod
    async def get_full_station_data_range(
        self,
        station_id: str,
        start_date: datetime,
        end_date: datetime,
    ) -> List[StationData]:
        ...

    @abstractmethod
    async def get_assumed_connection_status(self, station_id: int) -> AssumedStationStatus:
        ...

    @abstractmethod
    async def get_last_station_data(self, station_id: PydanticObjectId) -> StationData:
        ...

    @abstractmethod
    async def get_station_data_average_column(
        self,
        start_date: datetime | None,
        end_date: datetime | None,
        station_id: int,
        column_name: str,
    ) -> float:
        ...

    @abstractmethod
    async def get_station_data_tuple(station_id: str) -> Optional[StationStatisticData]:
        ...

    @abstractmethod
    async def delete_old_data(self, keep_days: int):
        ...
