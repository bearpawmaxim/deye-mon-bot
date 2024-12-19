from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services

def register(app, services: Services):

    @app.route('/api/stations/stations', methods=['POST'])
    @jwt_required()
    def get_stations():
        stations = services.database.get_stations()
        stations_dict = []
        for station in stations:
            stations_dict.append({
                'id': station.id,
                'stationName': station.station_name,
                'connectionStatus': station.connection_status,
                'gridInterconnectionType': station.grid_interconnection_type,
                'lastUpdateTime': station.last_update_time,
                'enabled': station.enabled,
            })
        return jsonify(stations_dict)

    @app.route('/api/stations/save', methods=['PUT'])
    @jwt_required()
    def save_station():
        id = request.json.get("id", None)
        enabled = request.json.get("enabled", False)
        station_id = services.database.save_station_state(id, enabled)
        services.db.session.commit()
        return jsonify({ 'success': True, 'id': station_id }), 200