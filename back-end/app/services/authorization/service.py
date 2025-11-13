from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from flask_bcrypt import Bcrypt
from app.services.database.service import DatabaseService


class AuthorizationService():
    def __init__(self, database: DatabaseService):
        self._jwt = JWTManager()
        self._bcrypt = Bcrypt()
        self._database = database

    def init_app(self, app: Flask):
        self._bcrypt.init_app(app)
        self._jwt.init_app(app)

    def login(self, username: str, password: str):
        user = self._database.get_user(username)
        if not user:
            raise ValueError(f"User '{username}' not found or inactive")
        if user.is_reporter:
            raise ValueError(f"Reporter users cannot login through UI, sorry :(")
        if not self._bcrypt.check_password_hash(user.password, password):
            raise ValueError(f"Invalid password")

        return create_access_token(identity=user.name)

    def add_user(self, username: str, password: str):
        hashed_password = self._bcrypt.generate_password_hash(password)
        self._database.create_user(username, hashed_password)
