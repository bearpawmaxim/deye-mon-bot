from datetime import datetime, timezone
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
        name = "station_data"
        timeseries = {
            "time_field": "last_update_time",
            "meta_field": "station_id",
            "granularity": "minutes",
        }

    @property
    async def station(self):
        return await Station.get(self.station_id)


    def to_dict(self, tz=timezone.utc):
        return {
            'id': self.id,
            'station_id': self.station_id,
            'battery_power': self.battery_power,
            'battery_soc': self.battery_soc,
            'charge_power': self.charge_power,
            'code': self.code,
            'consumption_power': self.consumption_power,
            'discharge_power': self.discharge_power,
            'generation_power': self.generation_power,
            'grid_power': self.grid_power,
            'irradiate_intensity': self.irradiate_intensity,
            'last_update_time': (
                self.last_update_time
                    .replace(tzinfo=timezone.utc)
                    .astimezone(tz) if self.last_update_time else self.last_update_time
            ),
            'msg': self.msg,
            'purchase_power': self.purchase_power,
            'request_id': self.request_id,
            'wire_power': self.wire_power,
        }