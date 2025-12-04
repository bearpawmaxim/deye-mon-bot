from typing import List
from fastapi import FastAPI, Depends, HTTPException, Body, Path
from app.services import Services
from app.utils.jwt_dependencies import jwt_required

def register(app: FastAPI, services: Services):

    @app.post("/api/stationsData/stationsData")
    def get_stations_data(
        payload: dict = Body(...),
        claims=Depends(jwt_required)
    ):
        stations = services.database.get_stations()
        last_seconds: int = payload.get("lastSeconds", 3600)

        def get_station_data(station):
            stations_data = services.database.get_full_station_data(station.id, last_seconds)
            station_data = [
                {
                    "batterySoc": data.battery_soc,
                    "dischargePower": data.discharge_power or 0,
                    "chargePower": abs(data.charge_power) if data.charge_power else 0,
                    "consumptionPower": data.consumption_power or 0,
                    "date": data.last_update_time,
                }
                for data in stations_data
            ]
            return {
                "id": station.id,
                "name": station.station_name,
                "data": station_data
            }

        stations_data_dict = [get_station_data(station) for station in stations]
        return stations_data_dict

    @app.post("/api/stationsData/stationDetails/{station_id}")
    def get_station_details(
        station_id: int = Path(..., description="Station ID"),
        payload: dict = Body(...),
        claims=Depends(jwt_required)
    ):
        last_seconds: int = payload.get("lastSeconds", 86400)  # Default 24h

        from app.models import Station
        station = services.db.session.query(Station).filter_by(id=station_id).first()
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")

        stations_data = services.database.get_full_station_data(station_id, last_seconds)
        data_list = [
            {
                "id": data.id,
                "stationId": data.station_id,
                "batteryPower": data.battery_power,
                "batterySoc": data.battery_soc,
                "chargePower": data.charge_power,
                "code": data.code,
                "consumptionPower": data.consumption_power,
                "dischargePower": data.discharge_power,
                "generationPower": data.generation_power,
                "gridPower": data.grid_power,
                "irradiateIntensity": data.irradiate_intensity,
                "lastUpdateTime": data.last_update_time,
                "msg": data.msg,
                "purchasePower": data.purchase_power,
                "requestId": data.request_id,
                "wirePower": data.wire_power,
            }
            for data in stations_data
        ]

        return {
            "station": {
                "id": station.id,
                "stationId": station.station_id,
                "stationName": station.station_name,
                "connectionStatus": station.connection_status,
                "gridInterconnectionType": station.grid_interconnection_type,
                "installedCapacity": station.installed_capacity,
                "batteryCapacity": station.battery_capacity,
                "lastUpdateTime": station.last_update_time,
            },
            "data": data_list,
            "dataCount": len(data_list)
        }
