from flask import jsonify
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):
    @app.route('/api/lookup/<lookup_name>', methods=['GET'])
    @jwt_required()
    def get_lookup_values(lookup_name: str):
        values = services.database.get_lookup_values(lookup_name)
        return jsonify(values)
