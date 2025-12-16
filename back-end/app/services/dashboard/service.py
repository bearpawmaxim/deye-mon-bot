from datetime import datetime, timedelta, timezone
from typing import List
from beanie import PydanticObjectId
from injector import inject

from shared.models.building import Building
from shared.models.dashboard_config import DashboardConfig
from shared.models.ext_data import ExtData
from shared.services.events.service import EventsService
from ..base import BaseService
from app.repositories import (
    IDashboardRepository,
    IExtDataRepository,
    IStationsRepository,
    IStationsDataRepository,
    IUsersRepository,
)
from app.models.api import (
    BuildingResponse,
    BuildingSummaryResponse,
    BuildingWithSummaryResponse,
    DashboardConfigResponse,
    EditBuildingResponse,
    PeriodResponse,
    PowerLogsResponse,
    SaveBuildingRequest,
    SaveDashboardConfigRequest,
)
from app.utils import get_estimate_discharge_time


@inject
class DashboardService(BaseService):
    def __init__(
        self,
        events: EventsService,
        dashboard: IDashboardRepository,
        ext_data: IExtDataRepository,
        stations: IStationsRepository,
        stations_data: IStationsDataRepository,
        users: IUsersRepository,
    ):
        super().__init__(events)
        self._dashboard = dashboard
        self._ext_data = ext_data
        self._stations = stations
        self._stations_data = stations_data
        self._users = users


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
        await self.broadcast_public("dashboard_config_updated")
        return await self.get_config()


    def _process_building(self, building: Building) -> BuildingResponse:
        return BuildingResponse(
            id    = building.id,
            color = building.color,
            name  = building.name,
        )


    async def get_building(self, building_id: PydanticObjectId) -> EditBuildingResponse:
        building = await self._dashboard.get_building(building_id)
        response = self._process_building(building)
        return EditBuildingResponse(
            **response.model_dump(),
            report_user_id = building.report_user.id,
            station_id     = building.station.id
        )


    async def edit_building(
        self,
        building_id: PydanticObjectId,
        request: SaveBuildingRequest,
    ) -> PydanticObjectId:
        building = await self._dashboard.get_building(building_id)
        if building:
            station = await self._stations.get_station(request.station_id) if request.station_id else None
            user = await self._users.get_user_by_id(request.report_user_id) if request.report_user_id else None

            building.name = request.name
            building.color = request.color
            building.station = station
            building.report_user = user

            await self._dashboard.edit_building(building)
            await self.broadcast_public("buildings_updated")
            return building_id

        return None
    

    async def create_building(self, request: SaveBuildingRequest) -> PydanticObjectId:
        station = await self._stations.get_station(request.station_id) if request.station_id else None
        user = await self._users.get_user_by_id(request.report_user_id) if request.report_user_id else None

        building = Building(
            name        = request.name,
            color       = request.color,
            station     = station,
            report_user = user,
        )

        building_id = await self._dashboard.create_building(building)
        await self.broadcast_public("buildings_updated")
        return building_id


    async def delete_building(self, building_id: PydanticObjectId) -> bool:
        building = await self._dashboard.get_building(building_id)
        if building:
            await self._dashboard.delete_building(building)
            await self.broadcast_public("buildings_updated")
            return True
        return False


    async def get_buildings(self) -> List[BuildingResponse]:
        buildings = await self._dashboard.get_buildings()
        return [self._process_building(building) for building in buildings]


    async def _process_building_summary(self, building: Building, minutes) -> BuildingSummaryResponse:
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
                estimate_discharge_time = get_estimate_discharge_time(
                    batt_capacity, soc, average_consumption_w / 1000
                )
                result.battery_discharge_time = estimate_discharge_time

        return result


    async def get_buildings_summary(self, building_ids: List[PydanticObjectId]) -> List[BuildingSummaryResponse]:
        buildings = await self._dashboard.get_buildings(building_ids)
        minutes = 25

        return [await self._process_building_summary(b, minutes) for b in buildings]


    async def get_buildings_with_summary(self) -> List[BuildingWithSummaryResponse]:
        buildings = await self._dashboard.get_buildings()
        minutes = 25

        async def process_building(building: Building) -> BuildingWithSummaryResponse:
            res = await self._process_building_summary(building, minutes)
            
            return BuildingWithSummaryResponse(
                **res.model_dump(),
                name  = building.name,
                color = building.color,
            )

        return [await process_building(b) for b in buildings]


    async def get_power_logs(
        self,
        building_id: PydanticObjectId,
        start_date: datetime,
        end_date: datetime,
    ) -> PowerLogsResponse:
        building = await self._dashboard.get_building(building_id)
        if not building:
            return None

        records = await self._ext_data.get_ext_data_statistics(building.report_user.id, start_date, end_date)

        periods = []
        total_available_seconds = 0
        total_unavailable_seconds = 0

        if not records:
            last_record = await self._ext_data.get_last_ext_data_before_date(building.report_user.id, start_date)
            duration_seconds = (end_date - start_date).total_seconds()
            if last_record:
                total_available_seconds = duration_seconds if last_record.grid_state else 0
                total_unavailable_seconds = duration_seconds if not last_record.grid_state else 0
                period = PeriodResponse(
                    start_time       = start_date.isoformat(),
                    end_time         = end_date.isoformat(),
                    is_available     = last_record.grid_state,
                    duration_seconds = int(duration_seconds)
                )
                periods.append(period)
            total_seconds = int(duration_seconds)
            return PowerLogsResponse(
                periods                   = periods,
                totalAvailableSeconds     = int(total_available_seconds),
                total_unavailable_seconds = int(total_unavailable_seconds),
                total_seconds             = total_seconds
            )

        # Insert synthetic record if needed
        first_record = records[0]
        if first_record.received_at.tzinfo is None:
            first_record.received_at = first_record.received_at.replace(tzinfo=timezone.utc)

        if first_record.received_at > start_date:
            last_before = await self._ext_data.get_last_ext_data_before_date(building.report_user.id, start_date)
            if last_before:
                synthetic_record = ExtData()
                synthetic_record.received_at = start_date
                synthetic_record.grid_state = last_before.grid_state
                synthetic_record.user_id = building.report_user.id
                records.insert(0, synthetic_record)

        # Calculate periods
        for i, current in enumerate(records):
            current_time = current.received_at
            if current_time.tzinfo is None:
                current_time = current_time.replace(tzinfo=timezone.utc)

            end_time = records[i + 1].received_at if i < len(records) - 1 else end_date
            if end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=timezone.utc)
            duration_seconds = (end_time - current_time).total_seconds()
            if current.grid_state:
                total_available_seconds += duration_seconds
            else:
                total_unavailable_seconds += duration_seconds
            period = PeriodResponse(
                start_time       = current_time.isoformat(),
                end_time         = end_time.isoformat(),
                is_available     = current.grid_state,
                duration_seconds = int(duration_seconds),
            )
            periods.append(period)

        total_seconds = int(total_available_seconds + total_unavailable_seconds)

        return PowerLogsResponse(
            periods                   = periods,
            total_available_seconds   = int(total_available_seconds),
            total_unavailable_seconds = int(total_unavailable_seconds),
            total_seconds             = total_seconds,
        )
