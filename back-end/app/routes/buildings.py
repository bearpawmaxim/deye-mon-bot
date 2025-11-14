from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/buildings/buildings', methods=['POST'])
    def get_buildings():
        buildings = services.database.get_buildings()

        def process_building(building):
            return {
                'id': building.id,
                'name': building.name,
                'color': building.color
            }

        futures = [services.executor.submit(process_building, building) for building in buildings]
        buildings_dict = [future.result() for future in futures]

        return jsonify(buildings_dict)
    
    @app.route('/api/buildings/dashboardConfig', methods=['POST'])
    def get_dashboard_config():
        configs = services.database.get_dashboard_config()
        
        def process_config(config):
            return {
                'key': config.key,
                'value': config.value,
            }
        
        futures = [services.executor.submit(process_config, config) for config in configs]
        configs_dict = [future.result() for future in futures]

        return jsonify(configs_dict)