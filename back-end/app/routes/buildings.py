from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import Body, FastAPI, Depends, HTTPException
from fastapi_injector import Injected
from app.services import Services, DashboardService
from app.utils.jwt_dependencies import jwt_required
from app.models import Building
from app.models.api import SaveBuildingRequest, PowerLogsRequest
from app.models.api.dashboard import BuildingResponse, BuildingSummaryResponse, BuildingWithSummaryResponse


def register(app: FastAPI, services: Services):

    @app.get("/api/dashboard/buildings")
    async def get_buildings(
        dashboard = Injected(DashboardService),
    ) -> List[BuildingResponse]:
        return await dashboard.get_buildings()

    @app.get("/api/dashboard/summary")
    async def get_buildings_summary(
        building_ids: List[PydanticObjectId] = Body(...),
        dashboard = Injected(DashboardService),
    ) -> List[BuildingSummaryResponse]:
        return await dashboard.get_buildings_summary(building_ids)

    @app.get("/api/buildings/buildings")
    async def get_buildings_data(
        dashboard = Injected(DashboardService),
    ) -> List[BuildingWithSummaryResponse]:
        return await dashboard.get_buildings_with_summary()

    @app.get("/api/buildings/dashboardConfig")
    def get_dashboard_config():
        configs = services.database.get_dashboard_config()

        def process_config(config):
            return {"key": config.key, "value": config.value}

        futures = [services.executor.submit(process_config, config) for config in configs]
        return [f.result() for f in futures]

    @app.post("/api/buildings/updateDashboardConfig")
    def update_dashboard_config(body: List[dict], _=Depends(jwt_required)):
        if not body or not isinstance(body, list):
            raise HTTPException(status_code=400, detail="Invalid payload")

        for item in body:
            key = item.get("key")
            value = item.get("value")
            if key is None:
                continue

            value_str = "true" if isinstance(value, bool) and value else "false" if isinstance(value, bool) else str(value or "")
            services.database.create_dashboard_config(key, value_str)

        services.database.save_changes()
        services.events.broadcast_public("dashboard_config_updated")

        configs = services.database.get_dashboard_config()
        return [{"key": c.key, "value": c.value} for c in configs]

    @app.get("/api/buildings/building/{building_id}")
    def get_building(building_id: int, _=Depends(jwt_required)):
        building = services.database.get_building(building_id)
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        return {
            "id": building.id,
            "name": building.name,
            "color": building.color,
            "stationId": building.station_id,
            "reportUserId": building.report_user_id,
        }

    @app.put("/api/buildings/save")
    def save_building(body: SaveBuildingRequest, _=Depends(jwt_required)):
        building = Building(
            id=body.id,
            name=body.name,
            color=body.color,
            station_id=body.stationId,
            report_user_id=body.reportUserId,
        )
        building_id = services.database.save_building(building)
        services.database.save_changes()
        services.events.broadcast_public("buildings_updated")
        return { "success": True, "id": building_id }

    @app.delete("/api/buildings/delete/{building_id}")
    def delete_building(building_id: int, _=Depends(jwt_required)):
        services.database.delete_building(building_id)
        services.database.save_changes()
        services.events.broadcast_public("buildings_updated")
        return { "success": True, "id": building_id }

    @app.post("/api/buildings/{building_id}/power-logs")
    def get_building_power_logs(building_id: int, body: PowerLogsRequest):
        building = services.database.get_building(building_id)
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")

        try:
            start_date = datetime.fromisoformat(body.startDate.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(body.endDate.replace("Z", "+00:00"))

            start_date = start_date.replace(tzinfo=timezone.utc) if start_date.tzinfo is None else start_date
            end_date = end_date.replace(tzinfo=timezone.utc) if end_date.tzinfo is None else end_date

            if start_date >= end_date:
                raise HTTPException(status_code=400, detail="startDate must be before endDate")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")

        records = services.database.get_ext_data_statistics(building.report_user_id, start_date, end_date)

        periods = []
        total_available_seconds = 0
        total_unavailable_seconds = 0

        if not records:
            last_record = services.database.get_last_ext_data_before_date(building.report_user_id, start_date)
            duration_seconds = (end_date - start_date).total_seconds()
            if last_record:
                total_available_seconds = duration_seconds if last_record.grid_state else 0
                total_unavailable_seconds = duration_seconds if not last_record.grid_state else 0
                periods.append({
                    "startTime": start_date.isoformat(),
                    "endTime": end_date.isoformat(),
                    "isAvailable": last_record.grid_state,
                    "durationSeconds": int(duration_seconds)
                })
            total_seconds = int(duration_seconds)
            return {
                "periods": periods,
                "totalAvailableSeconds": int(total_available_seconds),
                "totalUnavailableSeconds": int(total_unavailable_seconds),
                "totalSeconds": total_seconds
            }

        # Insert synthetic record if needed
        first_record = records[0]
        if first_record.received_at.tzinfo is None:
            first_record.received_at = first_record.received_at.replace(tzinfo=timezone.utc)

        if first_record.received_at > start_date:
            last_before = services.database.get_last_ext_data_before_date(building.report_user_id, start_date)
            if last_before:
                from app.models import ExtData
                synthetic_record = ExtData()
                synthetic_record.received_at = start_date
                synthetic_record.grid_state = last_before.grid_state
                synthetic_record.user_id = building.report_user_id
                records.insert(0, synthetic_record)

        # Calculate periods
        for i, current in enumerate(records):
            current_time = current.received_at
            end_time = records[i + 1].received_at if i < len(records) - 1 else end_date
            duration_seconds = (end_time - current_time).total_seconds()
            if current.grid_state:
                total_available_seconds += duration_seconds
            else:
                total_unavailable_seconds += duration_seconds
            periods.append({
                "startTime": current_time.isoformat(),
                "endTime": end_time.isoformat(),
                "isAvailable": current.grid_state,
                "durationSeconds": int(duration_seconds)
            })

        total_seconds = int(total_available_seconds + total_unavailable_seconds)

        return {
            "periods": periods,
            "totalAvailableSeconds": int(total_available_seconds),
            "totalUnavailableSeconds": int(total_unavailable_seconds),
            "totalSeconds": total_seconds
        }
