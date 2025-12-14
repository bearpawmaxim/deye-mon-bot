from datetime import datetime, timedelta, timezone
import traceback
from typing import List, Optional, get_origin, get_args

from beanie import PydanticObjectId

from app.models import StationStatisticData
from ..interfaces.stations_data import IStationsDataRepository
from shared.models import Station, StationData
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

    async def get_full_station_data(self, station_id: PydanticObjectId, last_seconds: int) -> List[StationData]:
        try:
            min_date = datetime.now(timezone.utc) - timedelta(seconds=last_seconds)
            stations = await (
                StationData.find(
                    StationData.station_id == station_id,
                    StationData.last_update_time >= min_date
                )
                .sort(StationData.last_update_time)
                .to_list()
            )
            return stations
        except Exception as e:
            print(f"Error fetching station data: {e}")
            return []

    async def get_last_station_data(
        self,
        station_id: PydanticObjectId,
    ) -> StationData:
        station = await (
            StationData.find(
                StationData.station_id == station_id,
            )
            .sort(StationData.last_update_time)
            .first_or_none()
        )
        return station

    async def get_station_data_average_column(
        self,
        start_date: datetime | None,
        end_date: datetime | None,
        station_id: int,
        column_name: str,
    ) -> float:
        if column_name not in StationData.model_fields:
            raise ValueError(f"Field '{column_name}' does not exist in StationData model.")

        field_info = StationData.model_fields[column_name]
        field_type = field_info.annotation

        origin = get_origin(field_type)
        if origin is not None:
            args = get_args(field_type)
            field_type = args[0]

        if field_type not in (int, float):
            raise TypeError(
                f"Field '{column_name}' is not numeric (expected int or float; got {field_type})"
            )

        match: dict = {
            "station_id": station_id,
            column_name: { "$ne": None, "$ne": 0 },
        }

        if start_date:
            match["last_update_time"] = {"$gte": start_date}
        if end_date:
            match.setdefault("last_update_time", {})
            match["last_update_time"]["$lte"] = end_date

        pipeline = [
            { "$match": match },
            { "$group": { "_id": None, "avg_value": { "$avg": f"${column_name}" } } },
        ]

        result = await StationData.aggregate(pipeline).to_list()

        if not result:
            return 0.0

        return float(result[0].get("avg_value", 0.0))

    async def get_station_data_tuple(
        self,
        station_id: str,
    ) -> Optional[StationStatisticData]:
        try:
            station = await Station.find_one(Station.station_id == station_id)
            if not station:
                return None

            stations = (
                await StationData.find(
                    StationData.station_id == station.id
                )
                .sort("-last_update_time")
                .limit(2)
                .to_list()
            )

            if not stations:
                return None

            previous = stations[1] if len(stations) == 2 else None
            current = stations[0]

            return StationStatisticData(previous, current)

        except Exception as e:
            print(f"Error fetching station data tuple: {e}")
            return None

    async def delete_old_data(self, keep_days: int):
        timeout = datetime.now(timezone.utc) - timedelta(days = keep_days)
        print(f"removing stations data older than {timeout}")

        await StationData.find(
            StationData.last_update_time < timeout
        ).delete()
