from datetime import datetime
from typing import Optional

from beanie import Document
from beanie.odm.fields import PydanticObjectId

from .station import Station


class StationData(Document):
    station_id: PydanticObjectId

    battery_power: Optional[float] = None
    battery_soc: Optional[float] = None
    charge_power: Optional[float] = None
    code: Optional[str] = None
    consumption_power: Optional[float] = None
    discharge_power: Optional[float] = None
    generation_power: Optional[float] = None
    grid_power: Optional[float] = None
    irradiate_intensity: Optional[float] = None
    last_update_time: Optional[datetime] = None

    msg: Optional[str] = None
    purchase_power: Optional[float] = None
    request_id: Optional[str] = None
    wire_power: Optional[float] = None

    class Settings:
        name = "StationData"
        timeseries = {
            "time_field": "last_update_time",
            "meta_field": "station_id",
            "granularity": "minutes",
        }

    @property
    def station(self):
        return Station.get_link(self.station_id)
