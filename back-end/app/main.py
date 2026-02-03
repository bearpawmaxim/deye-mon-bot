
import logging
import sys
import time
from fastapi import FastAPI

from app.settings import Settings
from app.middlewares import LanguageMiddleware
from .lifespan import lifespan


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    stream=sys.stdout
)
logging.Formatter.converter = time.gmtime


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(
        title="SvitloPower",
        version="1.1.6",
        debug=settings.DEBUG,
        lifespan=lifespan
    )

    app.add_middleware(LanguageMiddleware)
    app.state.settings = settings

    return app
