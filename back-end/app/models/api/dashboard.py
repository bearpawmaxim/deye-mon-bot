from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field

from shared.models.localizable_value import LocalizableValue


class SaveDashboardConfigRequest(BaseModel):
    title: LocalizableValue
    enable_outages_schedule: bool = Field(False, alias="enableOutagesSchedule")
    outages_schedule_queue: Optional[str] = Field(None, alias="outagesScheduleQueue")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class DashboardConfigResponse(SaveDashboardConfigRequest):
    ...


class BuildingResponse(BaseModel):
    id: Optional[PydanticObjectId] = None
    name: LocalizableValue
    color: str

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class SaveBuildingRequest(BuildingResponse):
    name: LocalizableValue
    color: str = "#FFFFFF"
    station_id: Optional[PydanticObjectId] = Field(None, alias="stationId")
    report_user_ids: List[PydanticObjectId] = Field(None, alias="reportUserIds")
    enabled: bool

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class EditBuildingResponse(SaveBuildingRequest):
    ...


class PowerLogsRequest(BaseModel):
    start_date: str = Field(None, alias="startDate")
    end_date: str = Field(None, alias="endDate")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class BuildingsSummaryRequest(BaseModel):
    building_ids: List[PydanticObjectId] = Field(alias="buildingIds")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class BuildingSummaryResponse(BaseModel):
    id: PydanticObjectId
    is_grid_available: Optional[bool] = Field(None, alias="isGridAvailable")
    grid_availability_pct: Optional[int] = Field(None, alias="gridAvailabilityPct")
    has_mixed_reporter_states: Optional[bool] = Field(None, alias="hasMixedReporterStates")
    is_charging: Optional[bool] = Field(None, alias="isCharging")
    is_discharging: Optional[bool] = Field(None, alias="isDischarging")
    is_offline: Optional[bool] = Field(None, alias="isOffline")
    battery_percent: Optional[float] = Field(None, alias="batteryPercent")
    consumption_power: Optional[str] = Field(None, alias="consumptionPower")
    battery_discharge_time: Optional[str] = Field(None, alias="batteryDischargeTime")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class BuildingWithSummaryResponse(BuildingSummaryResponse, BuildingResponse):
    ...


class PeriodResponse(BaseModel):
    start_time: str = Field(alias="startTime")
    end_time: str = Field(alias="endTime")
    is_available: bool = Field(alias="isAvailable")
    duration_seconds: int = Field(alias="durationSeconds")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


class PowerLogsResponse(BaseModel):
    periods: List[PeriodResponse]
    total_available_seconds: int = Field(alias="totalAvailableSeconds")
    total_unavailable_seconds: int = Field(alias="totalUnavailableSeconds")
    total_seconds: int = Field(alias="totalSeconds")

    model_config = ConfigDict(
        populate_by_name = True,
        from_attributes  = True,
    )


__all__ = [
    "BuildingResponse",
    "BuildingSummaryResponse",
    "BuildingsSummaryRequest",
    "BuildingWithSummaryResponse",
    "DashboardConfigResponse",
    "EditBuildingResponse",
    "PowerLogsRequest",
    "PeriodResponse",
    "PowerLogsResponse",
    "SaveBuildingRequest",
    "SaveDashboardConfigRequest",
]