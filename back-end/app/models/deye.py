from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

# change connection_status to Enum: DeyeConnectionStatus
# connection_status values:
# NORMAL, NO_DEVICE, ALL_OFFLINE, PARTIAL_OFFLINE


class DeyeConnectionStatus(str, Enum):
    NORMAL = "NORMAL"
    NO_DEVICE = "NO_DEVICE"
    ALL_OFFLINE = "ALL_OFFLINE"
    PARTIAL_OFFLINE = "PARTIAL_OFFLINE"


class DeyeStation(BaseModel):
    id: int
    name: str
    owner_name: Optional[str] = Field(None, alias="ownerName")
    battery_soc: Optional[float] = Field(None, alias="batterySOC")
    connection_status: Optional[DeyeConnectionStatus] = Field(None, alias="connectionStatus")
    contact_phone: Optional[str] = Field(None, alias="contactPhone")
    created_date: Optional[float] = Field(None, alias="createdDate")
    generation_power: Optional[float] = Field(None, alias="generationPower")
    grid_interconnection_type: Optional[str] = Field(None, alias="gridInterconnectionType")
    installed_capacity: Optional[float] = Field(None, alias="installedCapacity")
    last_update_time: Optional[float] = Field(None, alias="lastUpdateTime")
    location_address: Optional[str] = Field(None, alias="locationAddress")
    location_lat: Optional[float] = Field(None, alias="locationLat")
    location_lng: Optional[float] = Field(None, alias="locationLng")
    region_nation_id: Optional[int] = Field(None, alias="regionNationId")
    region_timezone: Optional[str] = Field(None, alias="regionTimezone")
    start_operating_time: Optional[float] = Field(None, alias="startOperatingTime")

    model_config = ConfigDict(
        extra='ignore',
        populate_by_name=True,
    )


class DeyeStationList(BaseModel):
    code: str
    msg: str
    request_id: str = Field(..., alias="requestId")
    station_list: List[DeyeStation] = Field(default_factory=list, alias="stationList")
    success: bool
    total: int

    model_config = ConfigDict(
        extra='ignore',
        populate_by_name=True,
    )


class DeyeStationData(BaseModel):
    battery_power: Optional[float] = Field(None, alias="batteryPower")
    battery_soc: Optional[float] = Field(None, alias="batterySOC")
    charge_power: Optional[float] = Field(None, alias="chargePower")
    code: str
    consumption_power: Optional[float] = Field(None, alias="consumptionPower")
    discharge_power: Optional[float] = Field(None, alias="dischargePower")
    generation_power: Optional[float] = Field(None, alias="generationPower")
    grid_power: Optional[float] = Field(None, alias="gridPower")
    irradiate_intensity: Optional[float] = Field(None, alias="irradiateIntensity")
    last_update_time: float = Field(alias="lastUpdateTime")
    msg: str
    purchase_power: Optional[float] = Field(None, alias="purchasePower")
    request_id: str = Field(alias="requestId")
    success: bool
    wire_power: Optional[float] = Field(None, alias="wirePower")

    model_config = ConfigDict(
        frozen=False,
        populate_by_name=True,
        extra='ignore',
    )
