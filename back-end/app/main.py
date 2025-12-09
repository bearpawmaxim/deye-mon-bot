from contextlib import asynccontextmanager
from fastapi import FastAPI
from injector import Injector

from app.settings import Settings
from app.jobs import register_jobs
from app.routes import register_routes
from app.services import Services, BeanieInitializer, BotsService, TelegramService
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.app_container import init_container


def create_user(config, services: Services):
    if not config.IS_MIGRATION_RUN and config.ADMIN_USER is not None:
        services.authorization.add_user(config.ADMIN_USER, config.ADMIN_PASSWORD)
        services.database.save_changes()


async def setup_bots(injector: Injector):
    bots_service = injector.get(BotsService)
    telegram_service = injector.get(TelegramService)
    bots = await bots_service.get_enabled_bots()
    for bot in bots:
        telegram_service.add_bot(bot.id, bot.token, bot.hook_enabled)


@asynccontextmanager
async def lifespan(app: FastAPI):
    injector: Injector = app.state.injector
    beanie_initializer = injector.get(BeanieInitializer)
    await beanie_initializer.init()
    scheduler = injector.get(AsyncIOScheduler)
    scheduler.start()
    await setup_bots(injector)
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

    return app
