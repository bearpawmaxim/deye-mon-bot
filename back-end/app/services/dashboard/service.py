from datetime import datetime, timedelta, timezone
from typing import List
from beanie import PydanticObjectId
from injector import inject

from shared.models.beanie.building import Building
from shared.models.beanie.dashboard_config import DashboardConfig
from shared.models.beanie.ext_data import ExtData
from shared.services.events.service import EventsService
from ..base import BaseService
from app.repositories import IDashboardRepository, IExtDataRepository, IStationsDataRepository
from app.models.api import (
    BuildingResponse,
    BuildingSummaryResponse,
    BuildingWithSummaryResponse,
    DashboardConfigResponse,
    SaveDashboardConfigRequest,
)
from app.utils import get_average_discharge_time


@inject
class DashboardService(BaseService):
    def __init__(
        self,
        events: EventsService,
        dashboard: IDashboardRepository,
        ext_data: IExtDataRepository,
        stations_data: IStationsDataRepository,
    ):
        super().__init__(events)
        self._dashboard = dashboard
        self._ext_data = ext_data
        self._stations_data = stations_data


    async def get_config(self) -> DashboardConfigResponse:
        config = await self._dashboard.get_config()
        return DashboardConfigResponse(
            title                   = config.title,
            enable_outages_schedule = config.enable_outages_schedule,
            outages_schedule_queue  = config.outages_schedule_queue,
        )


    async def save_config(self, config: SaveDashboardConfigRequest) -> DashboardConfigResponse:
        config = DashboardConfig(
            title                   = config.title,
            enable_outages_schedule = config.enable_outages_schedule,
            outages_schedule_queue  = config.outages_schedule_queue,
        )
        await self._dashboard.save_config(config)
        self.broadcast_public("dashboard_config_updated")
        return await self.get_config()


    async def get_buildings(self) -> List[BuildingResponse]:
        buildings = await self._dashboard.get_buildings()

        def process_building(building: Building) -> BuildingResponse:
            return BuildingResponse(
                id    = building.id,
                color = building.color,
                name  = building.name,
            )

        return [process_building(building) for building in buildings]
    

    async def _process_building(self, building: Building, minutes) -> BuildingSummaryResponse:
        result = BuildingSummaryResponse(
            id    = building.id
        )

        ext_data: ExtData = await self._ext_data.get_last_ext_data_by_user_id(building.report_user.id)
        if ext_data:
            result.is_grid_available = ext_data.grid_state

        if building.station:
            station_id = building.station.id
            station_data = await self._stations_data.get_last_station_data(station_id)
            if station_data is None:
                return result

            is_discharging = (station_data.discharge_power or 0) > 200
            is_charging = (station_data.charge_power or 0) * -1 > 200

            result.is_charging = is_charging
            result.is_discharging = is_discharging
            result.battery_percent = station_data.battery_soc

            average_consumption_w = await self._stations_data.get_station_data_average_column(
                datetime.now(timezone.utc) - timedelta(minutes=minutes),
                datetime.now(timezone.utc),
                station_id,
                "consumption_power",
            ) or 0

            result.consumption_power = f"{(average_consumption_w / 1000):.2f}"

            if is_discharging and average_consumption_w > 0:
                batt_capacity = building.station.battery_capacity
                soc = station_data.battery_soc
                estimate_discharge_time = get_average_discharge_time(
                    batt_capacity, soc, average_consumption_w / 1000
                )
                result.battery_discharge_time = estimate_discharge_time

        return result

    async def get_buildings_summary(self, building_ids: List[PydanticObjectId]) -> List[BuildingSummaryResponse]:
        buildings = await self._dashboard.get_buildings(building_ids)
        minutes = 25

        return [await self._process_building(b, minutes) for b in buildings]

    async def get_buildings_with_summary(self) -> List[BuildingWithSummaryResponse]:
        buildings = await self._dashboard.get_buildings()
        minutes = 25

        async def process_building(building: Building) -> BuildingWithSummaryResponse:
            res = await self._process_building(building, minutes)
            
            return BuildingWithSummaryResponse(
                **res.model_dump(),
                name  = building.name,
                color = building.color,
            )

        return [await process_building(b) for b in buildings]
