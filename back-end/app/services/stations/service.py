import asyncio
from typing import List
from injector import inject

from app.repositories import IStationsRepository, IStationsDataRepository
from shared.models import Station, StationData
from shared.services.events.service import EventsService
from ..base import BaseService
from ..deye_api import DeyeApiService


@inject
class StationsService(BaseService):
    def __init__(
        self,
        events: EventsService,
        deye_api: DeyeApiService,
        stations: IStationsRepository,
        stations_data: IStationsDataRepository,
    ):
        super().__init__(events)
        self._deye_api = deye_api
        self._stations = stations
        self._stations_data = stations_data

    async def get_stations(self):
        return await self._stations.get_stations(all=True)

    async def _get_station_data(self, station: Station, last_seconds: int):
        station_data = await self._stations_data.get_full_station_data(station.id, last_seconds)
        return station, station_data

    async def get_station_data(self, station_id: str, last_seconds: int) -> tuple[Station, List[StationData]]:
        station = await self._stations.get_station(station_id)
        if not station:
            return None, None

        return await self._get_station_data(station, last_seconds)

    async def get_stations_data(self, last_seconds: int) -> List[tuple[Station, List[StationData]]]:
        stations = await self._stations.get_stations()
        tasks = [
            asyncio.create_task(self._get_station_data(station, last_seconds))
            for station in stations
        ]

        return await asyncio.gather(*tasks)

    async def edit_station(
        self,
        station_id: str,
        enabled: bool,
        order: int,
        battery_capacity: float,
    ):
        await self._stations.edit_station(
            station_id       = station_id,
            enabled          = enabled,
            order            = order,
            battery_capacity = battery_capacity
        )

    async def sync_stations(self):
        stations = await self._deye_api.get_station_list()
        if stations is None:
            return
        for station in stations.station_list:
            await self._stations.add_station(station)

    async def sync_stations_data(self):
        stations = await self._stations.get_stations()
        
        for station in stations:
            station_data = await self._deye_api.get_station_data(station.station_id)
            if station_data is None:
                continue

            await self._stations_data.add_station_data(station, station_data)
        await self.broadcast_public("station_data_updated")
