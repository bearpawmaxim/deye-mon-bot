from dataclasses import dataclass
from typing import List


@dataclass
class DeyeStation:
    battery_soc: float
    connection_status: str
    contact_phone: str
    created_date: str
    generation_power: str
    grid_interconnection_type: str
    id: str
    installed_capacity: float
    last_update_time: str
    location_address: str
    location_lat: float
    location_lng: float
    name: str
    owner_name: str
    region_nation_id: int
    region_timezone: str
    start_operating_time: str


@dataclass
class DeyeStationList:
    code: str
    msg: str
    request_id: str
    station_list: List[DeyeStation]
    success: bool
    total: int

@dataclass
class DeyeStationData:
    battery_power: float
    battery_soc: float
    charge_power: float
    code: str
    consumption_power: float
    discharge_power: float
    generation_power: float
    grid_power: float
    irradiate_intensity: float
    last_update_time: str
    msg: str
    purchase_power: float
    request_id: str
    success: bool
    wire_power: float
