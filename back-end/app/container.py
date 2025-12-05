from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from fastapi import FastAPI
from fastapi_injector import attach_injector
from injector import Binder, Injector, Module, singleton, noscope
from apscheduler.schedulers.background import BlockingScheduler, BackgroundScheduler
from concurrent.futures import Executor, ThreadPoolExecutor

from app.settings import Settings
from shared.services.events.models import EventsServiceConfig
from .services.authorization import AuthorizationService
from .services.database import DatabaseService, DBSession
from .services.bot import BotConfig, BotService
from .services.outages_schedule import OutagesScheduleService
from .services.telegram import TelegramConfig, TelegramService
from .services.deye_api import DeyeConfig, DeyeApiService
from .services.visit_counter import VisitCounterService
from shared.services import EventsService
from .services import Services


class Container(Module):
    def __init__(self, settings: Settings):
        self._settings = settings

    def create_sqlalchemy_engine(self):
        return create_engine(
            self._settings.SQLALCHEMY_DATABASE_URI,
            echo=self._settings.DEBUG,
            future=True
        )

    def create_scoped_session(self, engine):
        factory = sessionmaker(
            bind=engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
            future=True,
        )
        return scoped_session(factory)

    def configure(self, binder: Binder):
        binder.bind(Settings, to=self._settings, scope=singleton)

        engine = self.create_sqlalchemy_engine()
        binder.bind(Engine, to=engine, scope=singleton)

        session_local = self.create_scoped_session(engine)
        binder.bind(DBSession, to=session_local, scope=singleton)

        binder.bind(DatabaseService, scope=noscope)

        binder.bind(AuthorizationService, scope=singleton)

        binder.bind(DeyeConfig, scope=singleton)
        binder.bind(DeyeApiService, scope=singleton)

        events_service_config = EventsServiceConfig(str(self._settings.REDIS_URL), self._settings.DEBUG)
        binder.bind(EventsServiceConfig, to=events_service_config, scope=singleton)
        binder.bind(EventsService, to=EventsService(events_service_config), scope=singleton)
        binder.bind(OutagesScheduleService, scope=singleton)

        binder.bind(TelegramConfig, scope=singleton)
        binder.bind(TelegramService, scope=singleton)

        binder.bind(BotConfig, scope=singleton)
        binder.bind(BotService, scope=singleton)

        binder.bind(VisitCounterService, scope=noscope)

        scheduler = BackgroundScheduler()
        binder.bind(BackgroundScheduler, to=scheduler, scope=singleton)
        binder.bind(ThreadPoolExecutor, to=ThreadPoolExecutor(), scope=singleton)

        binder.bind(Services, scope=noscope)


def init_container(app: FastAPI, config: Settings) -> Injector:
    container = Container(config)
    injector = Injector([container])
    attach_injector(app, injector)
    return injector