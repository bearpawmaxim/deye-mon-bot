import os
from app.services import Services
from app.utils.registration import load_and_register_modules


def register_routes(app, services: Services):
    base_path = os.path.dirname(__file__)
    package = 'app.routes'
    load_and_register_modules(base_path, package, 'register', app, services)
