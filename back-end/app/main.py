from contextlib import asynccontextmanager
from fastapi import FastAPI
from injector import Injector

from app.settings import Settings
from app.jobs import register_jobs
from app.routes import register_routes
from app.services import Services, BeanieInitializer
from apscheduler.schedulers.background import BackgroundScheduler
from app.app_container import init_container


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

@asynccontextmanager
async def lifespan(app: FastAPI):
    injector: Injector = app.state.injector
    beanie_initializer = injector.get(BeanieInitializer)
    scheduler = injector.get(BackgroundScheduler)
    scheduler.start()
    await beanie_initializer.init()
    yield
    scheduler.shutdown()


def create_app(settings: Settings) -> FastAPI:

    app = FastAPI(
        title = "Deye Monitor Bot",
        version = "1.0.0",
        debug = settings.DEBUG,
        lifespan = lifespan
    )
    injector = init_container(app, settings)
    services = injector.get(Services)

    register_routes(app, services)
    register_jobs(settings, injector)
    create_user(settings, services)
    setup_bots(services)
    fetch_stations(services)

    return app
