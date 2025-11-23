from datetime import datetime, timedelta, timezone
from flask import json, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required, unset_jwt_cookies
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        rjson = request.json
        user_name = rjson.get("userName", None)
        password = rjson.get("password", None)
        try:
            access_token, refresh_token = services.authorization.login(user_name, password)
            return { "success": True, "accessToken": access_token, "refreshToken": refresh_token }
        except ValueError as e:
            return { "success": False, "error": str(e) }, 401

    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def profile():
        current_user = get_jwt_identity()
        user = services.database.get_user(current_user)
        if user is None:
            return { "success": False, "error": "Cannot find user" }, 400

        return { "success": True, "userName": user.name, "userId": user.id }

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        response = jsonify({ "success": True })
        unset_jwt_cookies(response)
        return response

    @app.route("/api/auth/saveProfile", methods=['POST'])
    @jwt_required()
    def save_profile():
        rjson = request.json
        user_id = rjson.get("userId", None)
        user_name = rjson.get("userName", None)
        if user_id is None or user_name is None:
            return { "success": False, "error": "Invalid request" }, 400

        services.authorization.update_user(user_id, user_name)
        return { "success": True }

    @app.route("/api/auth/startPasswordChange", methods=['POST'])
    @jwt_required()
    def start_password_change():
        user_name = request.json.get("userName", None)
        try:
            token = services.authorization.start_change_password(user_name)
            return { "success": True, "resetToken": token }
        except ValueError as e:
            print(f'Error changing password: {e}')
            return { "success": False, "error": "Error changing password" }, 500
        
    @app.route("/api/auth/cancelPasswordChange", methods=['POST'])
    def cancel_password_change():
        user_name = request.json.get("userName", None)
        try:
            token = services.authorization.cancel_change_password(user_name)
            return { "success": True, "resetToken": token }
        except ValueError as e:
            print(f'Error changing password: {e}')
            return { "success": False, "error": "Error changing password" }, 500


    @app.route("/api/auth/changePassword", methods=['POST'])
    def change_password():
        rjson = request.json
        try:
            token = rjson.get("resetToken", None)
            if token is None:
                raise ValueError("Invalid token")

            new_password = rjson.get("newPassword", None)
            if new_password is None:
                raise ValueError("No password specified")

            print(f'token: {token}')
            print(f"new passwd: {new_password}")
            services.authorization.change_password(token, new_password)
            return { "success": True }
        except ValueError as e:
            return { "success": False, "error": str(e) }, 401


    @app.route("/api/auth/refresh", methods=["POST"])
    @jwt_required(refresh=True)
    def refresh():
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        auth_header = request.headers.get("Authorization", "")
        raw_refresh_token = auth_header.replace("Bearer ", "")

        return { "success": True, "accessToken": access_token, "refreshToken": raw_refresh_token }
