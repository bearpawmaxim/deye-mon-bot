from fastapi import FastAPI

from app.settings import Settings
from app.app_container import init_container
from .lifespan import lifespan


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(
        title="Deye Monitor Bot",
        version="1.0.0",
        debug=settings.DEBUG,
        lifespan=lifespan
    )

    injector = init_container(app, settings)
    app.state.injector = injector

    return app
