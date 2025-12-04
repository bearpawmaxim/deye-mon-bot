from fastapi import FastAPI, Depends, Body
from app.services import Services
from app.utils.jwt_dependencies import jwt_required


def register(app: FastAPI, services: Services):

    @app.post("/api/stations/stations")
    def get_stations(claims=Depends(jwt_required)):
        stations = services.database.get_stations(True)

        stations_dict = [
            {
                "id": station.id,
                "stationName": station.station_name,
                "connectionStatus": station.connection_status,
                "gridInterconnectionType": station.grid_interconnection_type,
                "lastUpdateTime": station.last_update_time,
                "batteryCapacity": station.battery_capacity or 0.0,
                "enabled": station.enabled,
                "order": station.order,
            }
            for station in stations
        ]

        return stations_dict

    @app.put("/api/stations/save")
    def save_station(
        payload: dict = Body(...),
        claims=Depends(jwt_required)
    ):
        station_id = services.database.save_station_data(
            payload.get("id"),
            payload.get("enabled", False),
            payload.get("order", 1),
            payload.get("batteryCapacity"),
        )

        services.database.save_changes()
        services.events.broadcast_private("stations_updated")

        return {"success": True, "id": station_id}
