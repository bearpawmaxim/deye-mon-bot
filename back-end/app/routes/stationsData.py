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

    @app.route('/api/stationsData/stationDetails/<int:station_id>', methods=['POST'])
    @jwt_required()
    def get_station_details(station_id):
        last_seconds = request.json.get("lastSeconds", 86400)  # Default to 24 hours
        
        from app.models import Station
        station = services.db.session.query(Station).filter_by(id=station_id).first()
        if not station:
            return jsonify({ 'error': 'Station not found' }), 404
        
        stations_data = services.database.get_full_station_data(station_id, last_seconds)
        
        data_list = []
        for data in stations_data:
            data_list.append({
                'id': data.id,
                'stationId': data.station_id,
                'batteryPower': data.battery_power,
                'batterySoc': data.battery_soc,
                'chargePower': data.charge_power,
                'code': data.code,
                'consumptionPower': data.consumption_power,
                'dischargePower': data.discharge_power,
                'generationPower': data.generation_power,
                'gridPower': data.grid_power,
                'irradiateIntensity': data.irradiate_intensity,
                'lastUpdateTime': data.last_update_time,
                'msg': data.msg,
                'purchasePower': data.purchase_power,
                'requestId': data.request_id,
                'wirePower': data.wire_power,
            })
        
        return jsonify({
            'station': {
                'id': station.id,
                'stationId': station.station_id,
                'stationName': station.station_name,
                'connectionStatus': station.connection_status,
                'gridInterconnectionType': station.grid_interconnection_type,
                'installedCapacity': station.installed_capacity,
                'batteryCapacity': station.battery_capacity,
                'lastUpdateTime': station.last_update_time,
            },
            'data': data_list,
            'dataCount': len(data_list)
        })