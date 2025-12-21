from fastapi import FastAPI

from app.settings import Settings
from app.middlewares import LanguageMiddleware
from .lifespan import lifespan


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(
        title="Deye Monitor Bot",
        version="1.0.0",
        debug=settings.DEBUG,
        lifespan=lifespan
    )

    app.add_middleware(LanguageMiddleware)
    app.state.settings = settings

    return app
