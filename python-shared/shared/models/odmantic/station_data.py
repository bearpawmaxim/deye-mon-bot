from datetime import datetime, timezone
from odmantic import Model, Reference
from typing import Optional
from .station import Station

class StationData(Model):
    station: Station = Reference()

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

    def __str__(self):
        return (
            "StationData(\n"
            f"    id={self.id},\n"
            f"    station_id='{self.station.id if self.station else None}',\n"
            f"    battery_power={self.battery_power},\n"
            f"    battery_soc={self.battery_soc},\n"
            f"    charge_power={self.charge_power},\n"
            f"    code='{self.code}',\n"
            f"    consumption_power={self.consumption_power},\n"
            f"    discharge_power={self.discharge_power},\n"
            f"    generation_power={self.generation_power},\n"
            f"    grid_power={self.grid_power},\n"
            f"    irradiate_intensity={self.irradiate_intensity},\n"
            f"    last_update_time={self.last_update_time},\n"
            f"    msg='{self.msg}',\n"
            f"    purchase_power={self.purchase_power},\n"
            f"    request_id='{self.request_id}',\n"
            f"    wire_power={self.wire_power}\n"
            ")"
        )

    def to_dict(self, tz=timezone.utc):
        lut = self.last_update_time
        if lut:
            lut = lut.replace(tzinfo=timezone.utc).astimezone(tz)

        return {
            'id': str(self.id),
            'station_id': str(self.station.id) if self.station else None,
            'battery_power': self.battery_power,
            'battery_soc': self.battery_soc,
            'charge_power': self.charge_power,
            'code': self.code,
            'consumption_power': self.consumption_power,
            'discharge_power': self.discharge_power,
            'generation_power': self.generation_power,
            'grid_power': self.grid_power,
            'irradiate_intensity': self.irradiate_intensity,
            'last_update_time': lut,
            'msg': self.msg,
            'purchase_power': self.purchase_power,
            'request_id': self.request_id,
            'wire_power': self.wire_power,
        }

    class Config:
        collection = "station_data"
