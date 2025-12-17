from typing import List
from fastapi import FastAPI, Depends, HTTPException, Body, Path
from fastapi_injector import Injected
from app.services import StationsService
from app.utils.jwt_dependencies import jwt_required

def register(app: FastAPI):

    @app.post("/api/stationsData/stationsData")
    async def get_stations_data(
        payload: dict = Body(...),
        _ = Depends(jwt_required),
        stations = Injected(StationsService)
    ):
        last_seconds: int = payload.get("lastSeconds", 3600)
        stations_data = await stations.get_stations_data(last_seconds)

        def get_station_data(station, station_data):
            return {
                "id": str(station.id),
                "name": station.station_name,
                "data": [
                    {
                        "batterySoc": d.battery_soc,
                        "dischargePower": d.discharge_power or 0,
                        "chargePower": abs(d.charge_power) if d.charge_power else 0,
                        "consumptionPower": d.consumption_power or 0,
                        "date": d.last_update_time,
                    }
                    for d in station_data
                ]
            }

        return [
            get_station_data(station, station_data)
            for (station, station_data) in stations_data
        ]


    @app.post("/api/stationsData/stationDetails/{station_id}")
    async def get_station_details(
        station_id: str = Path(..., description="Station ID"),
        payload: dict = Body(...),
        _ = Depends(jwt_required),
        stations = Injected(StationsService)
    ):
        last_seconds: int = payload.get("lastSeconds", 86400)  # Default 24h

        station, station_data = await stations.get_station_data(station_id, last_seconds)
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")

        data_list = [
            {
                "id": str(data.id),
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
            for data in station_data
        ]

        return {
            "station": {
                "id": str(station.id),
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
