from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

from shared.models.beanie import Station, StationData
from app.models.deye import DeyeStationData


class IStationsDataRepository(ABC):

    @abstractmethod
    async def add_station_data(self, station: Station, station_data: DeyeStationData):
        ...