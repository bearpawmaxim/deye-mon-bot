from injector import Binder, Module, singleton, noscope
from apscheduler.schedulers.background import BackgroundScheduler
from concurrent.futures import ThreadPoolExecutor

from app.settings import Settings
from shared.services.events import EventsService, EventsServiceConfig
from .beanie_initializer import BeanieInitializer
from .authorization import AuthorizationService
from .database import DatabaseService
from .bot import BotConfig, BotService
from .outages_schedule import OutagesScheduleService
from .telegram import TelegramConfig, TelegramService
from .deye_api import DeyeConfig, DeyeApiService
from .visit_counter import VisitCounterService
from .users import UsersService


class ServicesContainer(Module):
    def __init__(self, settings: Settings):
        self._settings = settings

    def configure(self, binder: Binder):
        binder.bind(DatabaseService, scope=noscope)

        beanie = BeanieInitializer(
            mongo_uri=str(self._settings.MONGO_URI),
            db_name=self._settings.MONGO_DB,
        )
        binder.bind(BeanieInitializer, to=beanie, scope=singleton)

        binder.bind(AuthorizationService, scope=singleton)

        binder.bind(DeyeConfig, scope=singleton)
        binder.bind(DeyeApiService, scope=singleton)

        events_service_config = EventsServiceConfig(str(self._settings.REDIS_URI), self._settings.DEBUG)
        binder.bind(EventsServiceConfig, to=events_service_config, scope=singleton)
        binder.bind(EventsService, to=EventsService(events_service_config), scope=singleton)
        binder.bind(OutagesScheduleService, scope=singleton)

        binder.bind(TelegramConfig, scope=singleton)
        binder.bind(TelegramService, scope=singleton)

        binder.bind(BotConfig, scope=singleton)
        binder.bind(BotService, scope=singleton)

        binder.bind(VisitCounterService, scope=noscope)

        binder.bind(UsersService, scope=noscope)

        scheduler = BackgroundScheduler()
        binder.bind(BackgroundScheduler, to=scheduler, scope=singleton)
        binder.bind(ThreadPoolExecutor, to=ThreadPoolExecutor(), scope=singleton)
