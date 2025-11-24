from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required

def register(app, services: Services):

    @app.route('/api/stations/stations', methods=['POST'])
    @jwt_required()
    def get_stations():
        stations = services.database.get_stations(True)
        stations_dict = []
        for station in stations:
            stations_dict.append({
                'id': station.id,
                'stationName': station.station_name,
                'connectionStatus': station.connection_status,
                'gridInterconnectionType': station.grid_interconnection_type,
                'lastUpdateTime': station.last_update_time,
                'batteryCapacity': station.battery_capacity if station.battery_capacity is not None else 0.0,
                'enabled': station.enabled,
                'order': station.order,
            })
        return jsonify(stations_dict)

    @app.route('/api/stations/save', methods=['PUT'])
    @jwt_required()
    def save_station():
        id = request.json.get("id", None)
        enabled = request.json.get("enabled", False)
        order = request.json.get("order", 1)
        battery_capacity = request.json.get("batteryCapacity", None)
        station_id = services.database.save_station_data(id, enabled, order, battery_capacity)
        services.db.session.commit()
        services.events.broadcast_private("stations_updated")
        return jsonify({ 'success': True, 'id': station_id }), 200