from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from app.services import Services
from app.utils import get_average_discharge_time
from app.utils.jwt_dependencies import jwt_required
from app.models import Building


class SaveBuildingRequest(BaseModel):
    id: Optional[int] = None
    name: str
    color: str = "#FFFFFF"
    stationId: Optional[int] = None
    reportUserId: Optional[int] = None


class PowerLogsRequest(BaseModel):
    startDate: str
    endDate: str


def register(app: FastAPI, services: Services):

    @app.get("/api/buildings/buildings")
    def get_buildings():
        buildings = services.database.get_buildings()
        minutes = 25

        def process_building(building):
            result_dict = {
                "id": building.id,
                "name": building.name,
                "color": building.color,
            }

            ext_data = services.database.get_latest_ext_data_by_user_id(building.report_user_id)
            if ext_data:
                result_dict["isGridAvailable"] = ext_data.grid_state

            if building.station:
                station_id = building.station_id
                station_data = services.database.get_last_station_data(station_id)
                if station_data is None:
                    return result_dict

                is_discharging = (station_data.discharge_power or 0) > 200
                is_charging = (station_data.charge_power or 0) * -1 > 200

                result_dict["isCharging"] = is_charging
                result_dict["isDischarging"] = is_discharging
                result_dict["batteryPercent"] = station_data.battery_soc

                average_consumption_w = services.database.get_station_data_average_column(
                    datetime.now(timezone.utc) - timedelta(minutes=minutes),
                    datetime.now(timezone.utc),
                    station_id,
                    "consumption_power",
                ) or 0

                result_dict["consumptionPower"] = f"{(average_consumption_w / 1000):.2f}"

                if is_discharging and average_consumption_w > 0:
                    batt_capacity = building.station.battery_capacity
                    soc = station_data.battery_soc
                    estimate_discharge_time = get_average_discharge_time(
                        batt_capacity, soc, average_consumption_w / 1000
                    )
                    result_dict["batteryDischargeTime"] = estimate_discharge_time

            return result_dict

        return [process_building(b) for b in buildings]

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
        return {"success": True, "id": building_id}

    @app.delete("/api/buildings/delete/{building_id}")
    def delete_building(building_id: int, _=Depends(jwt_required)):
        services.database.delete_building(building_id)
        services.database.save_changes()
        services.events.broadcast_public("buildings_updated")
        return {"success": True, "id": building_id}

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
