from flask import jsonify
from app.services import Services

def register(app, services: Services):

    @app.route('/api/stations/stations', methods=['POST'])
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
