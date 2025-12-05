from fastapi import FastAPI
from app.settings import Settings
from app.routes import register_routes
from shared.services import EventsService


def register_extensions(app: FastAPI, settings: Settings):
    pass

def create_app(settings: Settings = None):
    app = FastAPI(__name__)

    register_extensions(app, settings)

    events = EventsService(settings.REDIS_URL)
    register_routes(app, events)
    return app
