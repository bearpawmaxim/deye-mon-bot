import os
from injector import Injector

from shared.utils.registration import load_and_register_modules
from app.settings import Settings


def register_jobs(settings: Settings, injector: Injector):
    base_path = os.path.dirname(__file__)
    package = 'app.jobs'
    load_and_register_modules(base_path, package, 'register', settings, injector)
