from datetime import datetime, timedelta, timezone
from flask import json, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required, unset_jwt_cookies
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        username = request.json.get("username", None)
        password = request.json.get("password", None)
        try:
            token = services.authorization.login(username, password)
            return { "success": True, "access_token": token }
        except ValueError as e:
            return { "success": False, "error": str(e) }, 401

    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def profile():
        current_user = get_jwt_identity()

        return { "success": True, "name": current_user }

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        response = jsonify({ "success": True })
        unset_jwt_cookies(response)
        return response

    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=55))
            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                data = response.get_json()
                if type(data) is dict:
                    data["access_token"] = access_token
                    response.data = json.dumps(data)
            return response
        except (RuntimeError, KeyError):
            return response
