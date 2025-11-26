import os
from app.services import Services
from shared.utils.registration import load_and_register_modules
from app import Config


def register_jobs(config: Config, services: Services):
    base_path = os.path.dirname(__file__)
    package = 'app.jobs'
    load_and_register_modules(base_path, package, 'register', config, services)
