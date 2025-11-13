from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/stationsData/stationsData', methods=['POST'])
    @jwt_required()
    def get_stations_data():
        stations = services.database.get_stations()
        last_seconds = request.json.get("lastSeconds", 3600)

        def get_station_data(station):
            stations_data = services.database.get_full_station_data(station.id, last_seconds)
            station_data = []
            for data in stations_data:
                station_data.append({
                    'batterySoc': data.battery_soc,
                    'dischargePower': data.discharge_power or 0,
                    'chargePower': abs(data.charge_power) if data.charge_power else 0,
                    'consumptionPower': data.consumption_power or 0,
                    'date': data.last_update_time,
                })
            station_dict = {
                'id': station.id,
                'name': station.station_name,
                'data': station_data
            }
            return station_dict

        futures = [services.executor.submit(get_station_data, station) for station in stations]
        stations_data_dict = [future.result() for future in futures]

        return jsonify(stations_data_dict)
