from fastapi import FastAPI
from app.settings import Settings
from app.routes import register_routes
from shared.services import EventsService
from shared.services.events.models import EventsServiceConfig


def create_app(settings: Settings = None):
    app = FastAPI(
        title = "Deye Monitor Bot SSE",
        version = "1.0.0",
        debug = settings.DEBUG,
    )

    config = EventsServiceConfig(str(settings.REDIS_URI), settings.DEBUG)
    print(config)
    events = EventsService(config)
    register_routes(app, events, settings)
    return app
