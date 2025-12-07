from injector import inject

from app.repositories import IStationsRepository, IStationsDataRepository
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

    async def sync_stations(self):
        stations = self._deye_api.get_station_list()
        if stations is None:
            return
        for station in stations.station_list:
            await self._stations.add_station(station)

    async def sync_stations_data(self):
        stations = await self._stations.get_stations()
        
        for station in stations:
            station_data = self._deye_api.get_station_data(station.station_id)
            if station_data is None:
                continue

            await self._stations_data.add_station_data(station, station_data)
        self.broadcast_public("station_data_updated")
