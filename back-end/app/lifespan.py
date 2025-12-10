from fastapi import FastAPI
from injector import Injector
from contextlib import asynccontextmanager

from app.app_container import bind_client_session
from app.settings import Settings
from app.jobs import register_jobs
from app.routes import register_routes
from app.services import Services, BeanieInitializer, BotsService, TelegramService, DeyeApiService
from apscheduler.schedulers.asyncio import AsyncIOScheduler


def create_user(config, services: Services):
    if config.ADMIN_USER is not None:
        services.authorization.add_user(config.ADMIN_USER, config.ADMIN_PASSWORD)
        services.database.save_changes()


async def setup_bots(injector: Injector):
    bots_service = injector.get(BotsService)
    telegram_service = injector.get(TelegramService)
    bots = await bots_service.get_enabled_bots()
    for bot in bots:
        await telegram_service.add_bot(bot.id, bot.token, bot.hook_enabled)

@asynccontextmanager
async def lifespan(app: FastAPI):
    injector: Injector = app.state.injector
    bind_client_session(injector)
    beanie_initializer = injector.get(BeanieInitializer)
    await beanie_initializer.init()
    try:
        deye_service = injector.get(DeyeApiService)
        if hasattr(deye_service, "init"):
            await deye_service.init()
    except Exception:
        pass
    telegram_service = injector.get(TelegramService)
    scheduler = injector.get(AsyncIOScheduler)
    settings = injector.get(Settings)
    register_jobs(settings, injector)
    scheduler.start()

    services = injector.get(Services)
    register_routes(app, services)

    await setup_bots(injector)
    config = injector.get(Settings)
    if config.ADMIN_USER is not None:
        services.authorization.add_user(config.ADMIN_USER, config.ADMIN_PASSWORD)
        services.database.save_changes()
    yield
    try:
        scheduler.shutdown(wait=False)
    except Exception:
        pass
    if hasattr(telegram_service, "shutdown"):
        await telegram_service.shutdown()
    if 'deye_service' in locals() and hasattr(deye_service, "shutdown"):
        await deye_service.shutdown()
    await session.close()
