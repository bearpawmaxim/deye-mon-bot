from abc import ABC, abstractmethod
from typing import List

from shared.models.beanie.station import Station
from app.models.deye import DeyeStation


class IStationsRepository(ABC):
    
    @abstractmethod
    async def get_stations(self, all: bool = False) -> List[Station]:
        ...

    @abstractmethod
    async def add_station(self, station: DeyeStation):
        ...

    

    