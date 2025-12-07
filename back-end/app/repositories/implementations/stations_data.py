from datetime import datetime, timedelta, timezone
import traceback
from typing import List

from beanie import PydanticObjectId, SortDirection
import pymongo

from ..interfaces.stations_data import IStationsDataRepository
from shared.models.beanie import Station, StationData
from app.models.deye import DeyeStationData


class StationsDataRepository(IStationsDataRepository):

    async def add_station_data(self, station: Station, station_data: DeyeStationData):
        try:
            last_update_time = datetime.fromtimestamp(station_data.last_update_time, timezone.utc)
            existing_record = await StationData.find_one(
                StationData.station_id == station.id,
                StationData.last_update_time == last_update_time,
            )

            if not existing_record:
                new_record = StationData(
                    station_id          = station.id,
                    battery_power       = station_data.battery_power,
                    battery_soc         = station_data.battery_soc,
                    charge_power        = station_data.charge_power,
                    code                = station_data.code,
                    consumption_power   = station_data.consumption_power,
                    discharge_power     = station_data.discharge_power,
                    generation_power    = station_data.generation_power,
                    grid_power          = station_data.grid_power,
                    irradiate_intensity = station_data.irradiate_intensity,
                    last_update_time    = last_update_time,
                    msg                 = station_data.msg,
                    purchase_power      = station_data.purchase_power,
                    request_id          = station_data.request_id,
                    wire_power          = station_data.wire_power
                )
                await new_record.insert()
        except Exception as e:
            print(f"Error updating station data:")
            traceback.print_exc()

    async def get_full_station_data(self, station_id: str, last_seconds: int) -> List[StationData]:
        try:
            min_date = datetime.now(timezone.utc) - timedelta(seconds=last_seconds)
            stations = await (
                StationData.find(
                    StationData.station_id == PydanticObjectId(station_id),
                    StationData.last_update_time >= min_date
                )
                .sort(StationData.last_update_time)
                .to_list()
            )
            return stations
        except Exception as e:
            print(f"Error fetching station data: {e}")
            return []

