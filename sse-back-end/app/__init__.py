from flask import Flask
from flask_jwt_extended import JWTManager
from app.config import Config
from app.routes import register_routes
from shared.services import EventsService

jwt = JWTManager()

def register_extensions(app: Flask, config: Config):
    jwt.init_app(app)


def create_app(config:Config = None):
    app = Flask(__name__)
    app.config.from_object(config)

    register_extensions(app, config)

    events = EventsService(config.REDIS_URL)

    register_routes(app, events)
    return app
