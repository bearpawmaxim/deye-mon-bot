from contextlib import asynccontextmanager
import logging
import sys
import time
from fastapi import FastAPI
from app.settings import Settings
from app.routes import register_routes
from shared.services import EventsService
from shared.services.events.models import EventsServiceConfig
from shared.utils.signals import register_chained_signal_handlers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    stream=sys.stdout
)
logging.Formatter.converter = time.gmtime

async def make_shutdown_handler(events: EventsService):
    async def shutdown(signum: int):
        await events.request_shutdown()
    return shutdown

@asynccontextmanager
async def lifespan(app: FastAPI):
    events: EventsService = app.state.events
    await events.start()

    register_chained_signal_handlers(
        handler=await make_shutdown_handler(events)
    )

    yield
    await events.shutdown()

def create_app(settings: Settings = None):
    app = FastAPI(
        title = "SvitloPower SSE",
        version = "1.1.6",
        debug = settings.DEBUG,
        lifespan = lifespan,
    )

    config = EventsServiceConfig(str(settings.REDIS_URI), settings.DEBUG)
    events = EventsService(config)
    app.state.events = events
    register_routes(app, events, settings)
    return app
