import os

from app.settings import Settings
from shared.services import EventsService
from shared.utils.registration import load_and_register_modules


def register_routes(app, events: EventsService, settings: Settings):
    base_path = os.path.dirname(__file__)
    package = 'app.routes'
    load_and_register_modules(base_path, package, 'register', app, events, settings)
