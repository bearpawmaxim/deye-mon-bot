from datetime import datetime, timezone
import traceback
from typing import List

from ..interfaces.stations import IStationsRepository
from shared.models.beanie.station import Station
from app.models.deye import DeyeStation


class StationsRepository(IStationsRepository):

    async def get_stations(self, all: bool = False) -> List[Station]:
        query = {} if all else {"enabled": True}
        return await Station.find(query).to_list()

    async def add_station(self, station: DeyeStation):
        try:
            max_station = await Station.find().sort(-Station.order).first_or_none()
            max_order = max_station.order if max_station else 0

            existing_station = await Station.find_one(Station.station_id == station.id)

            if existing_station is None:
                new_record = Station(
                    station_id                = station.id,
                    station_name              = station.name,
                    connection_status         = station.connection_status,
                    contact_phone             = station.contact_phone,
                    created_date              = datetime.fromtimestamp(
                        station.created_date, timezone.utc
                    ),
                    grid_interconnection_type = station.grid_interconnection_type,
                    installed_capacity        = station.installed_capacity,
                    location_address          = station.location_address,
                    location_lat              = station.location_lat,
                    location_lng              = station.location_lng,
                    owner_name                = station.owner_name,
                    region_nation_id          = station.region_nation_id,
                    region_timezone           = station.region_timezone,
                    generation_power          = station.generation_power,
                    last_update_time          = datetime.fromtimestamp(
                        station.last_update_time, timezone.utc
                    ),
                    start_operating_time      = datetime.fromtimestamp(
                        station.start_operating_time, timezone.utc
                    ),
                    order                     = max_order + 1,
                )

                await new_record.insert()
            else:
                existing_station.connection_status = station.connection_status
                existing_station.grid_interconnection_type = station.grid_interconnection_type
                existing_station.last_update_time = datetime.fromtimestamp(
                    station.last_update_time, timezone.utc
                )
                await existing_station.save()

        except Exception as e:
            print(f"Error inserting station:")
            traceback.print_exc()
