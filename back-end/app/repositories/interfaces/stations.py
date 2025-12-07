from abc import ABC, abstractmethod
from typing import List

from shared.models.beanie.station import Station
from app.models.deye import DeyeStation


class IStationsRepository(ABC):
    
    @abstractmethod
    async def get_station(self, station_id: str) -> Station | None:
        ...

    @abstractmethod
    async def get_station_by_station_id(self, station_id: int) -> Station | None:
        ...

    @abstractmethod
    async def edit_station(
        self,
        station_id: str,
        enabled: bool,
        order: int,
        battery_capacity: float,
    ):
        ...

    @abstractmethod
    async def get_stations(self, all: bool = False) -> List[Station]:
        ...

    @abstractmethod
    async def add_station(self, station: DeyeStation):
        ...

    

    