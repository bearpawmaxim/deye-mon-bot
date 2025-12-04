from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from sqlalchemy.orm import scoped_session

from app.config import Config
from app.jobs import register_jobs
from app.routes import register_routes
from app.services import Services
from .container import init_container


def register_extensions(services: Services, config: Config):
    services.scheduler.start()

def create_user(config, services: Services):
    if not config.IS_MIGRATION_RUN and config.ADMIN_USER is not None:
        services.authorization.add_user(config.ADMIN_USER, config.ADMIN_PASSWORD)
        services.database.save_changes()

def setup_bots(services: Services):
    bots = services.database.get_bots()
    for bot in bots:
        services.telegram.add_bot(bot.id, bot.bot_token)

def fetch_stations(services: Services):
    stations = services.deye_api.get_station_list()
    if stations is None:
        return
    for station in stations.station_list:
        services.database.add_station(station)
    services.database.save_changes()

def create_app(config: Config) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        services.scheduler.shutdown()

    app = FastAPI(
        title = "Deye Monitor Bot",
        version = "1.0.0",
        debug = config.DEBUG,
        lifespan = lifespan
    )
    injector = init_container(app, config)

    services = injector.get(Services)

    register_extensions(services, config)
    register_routes(app, services)
    register_jobs(config, injector)
    create_user(config, services)
    setup_bots(services)
    fetch_stations(services)

    return app
