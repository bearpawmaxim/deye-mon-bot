from flask import jsonify
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
                'enabled': station.enabled,
            })
        return jsonify(stations_dict)
