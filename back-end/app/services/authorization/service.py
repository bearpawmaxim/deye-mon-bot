from datetime import datetime, timezone, timedelta
import secrets
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from flask_bcrypt import Bcrypt
from app.services.database.service import DatabaseService
from app.models import User

class AuthorizationService():
    def __init__(self, database: DatabaseService):
        self._jwt = JWTManager()
        self._bcrypt = Bcrypt()
        self._database = database

    def init_app(self, app: Flask):
        self._bcrypt.init_app(app)
        self._jwt.init_app(app)

    def _get_user(self, username: str, password: str):
        user = self._database.get_user(username)
        if not user:
            raise ValueError(f"User '{username}' not found or inactive")
        if user.is_reporter:
            raise ValueError(f"Reporter users cannot login through UI, sorry :(")
        if not self._bcrypt.check_password_hash(user.password, password):
            raise ValueError(f"Invalid password")

        return user

    def login(self, username: str, password: str):
        user = self._get_user(username, password)
        return create_access_token(identity=user.name)

    def _generate_passwd_reset_token(self, user: User):
        user.password_reset_token = secrets.token_urlsafe(64)
        user.reset_token_expiration = datetime.now(timezone.utc) + timedelta(hours=1)
        self._database.save_changes()
        return user.password_reset_token

    def _validate_reset_token(self, user: User):
        if user.reset_token_expiration < datetime.now(timezone.utc):
            user.reset_token_expiration = None
            user.password_reset_token = None
            self._database.save_changes()
            raise ValueError("Token expired")

        return user

    def create_reporter_token(self, user_name: str):
        return create_access_token(identity=user_name, additional_claims={"is_reporter": True}, expires_delta=False)

    def add_user(self, user_name: str, password: str):
        hashed_password = self._bcrypt.generate_password_hash(password)
        self._database.create_user(user_name, hashed_password)

    def start_change_password(self, user_name: str):
        user = self._database.get_user(user_name)
        if user is None:
            raise ValueError(f"Cannot find user '{user_name}'")

        token = self._generate_passwd_reset_token(user)
        return token
    
    def cancel_change_password(self, user_name: str):
        user = self._database.get_user(user_name)
        if user is None:
            raise ValueError(f"Cannot find user '{user_name}'")
        
        user.password_reset_token = None
        user.reset_token_expiration = None
        self._database.save_changes()

    def change_password(self, token: str, new_password: str):
        user = self._database.get_user_by_reset_token(token)
        if user is None:
            raise ValueError("Cannot find user")

        self._validate_reset_token(token)

        hashed_new_password = self._bcrypt.generate_password_hash(new_password)
        self._database.change_password(user.id, hashed_new_password)

    def update_user(self, user_id: int, username: str):
        self._database.update_user(user_id, username)
