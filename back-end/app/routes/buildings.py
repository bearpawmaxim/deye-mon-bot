from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/buildings/buildings', methods=['POST'])
    @jwt_required()
    def get_buildings():
        buildings = services.database.get_buildings()

        def process_building(building):
            return {
                'id': building.id,
                'name': building.name,
                'station_id': building.station_id,
                'station_name': building.station.station_name,
                'report_user_id': building.report_user.id,
                'report_user_name': building.report_user.name
            }

        futures = [services.executor.submit(process_building, building) for building in buildings]
        buildings_dict = [future.result() for future in futures]

        return jsonify(buildings_dict)