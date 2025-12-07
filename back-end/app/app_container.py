from fastapi import FastAPI
from fastapi_injector import attach_injector
from injector import Binder, Injector, Module, noscope, singleton
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

from app.settings import Settings
from .repositories import RepositoryContainer
from .services import Services, ServicesContainer
from .services.authorization import AuthorizationService
from .services.database import DBSession

class AppContainer(Module):
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

        binder.bind(AuthorizationService, scope=singleton)

        binder.bind(Services, scope=noscope)


def _create_containers(settings: Settings):
    app_container = AppContainer(settings)
    services_container = ServicesContainer(settings)
    repositories_container = RepositoryContainer()
    return [app_container, services_container, repositories_container]

def init_container(app: FastAPI, settings: Settings) -> Injector:
    containers = _create_containers(settings)
    injector = Injector(containers)
    attach_injector(app, injector)
    return injector