import os

from injector import Injector
from shared.utils.registration import load_and_register_modules
from app.config import Config
from app.services.database import DBSession

def register_jobs(config: Config, injector: Injector):
    base_path = os.path.dirname(__file__)
    package = 'app.jobs'
    load_and_register_modules(base_path, package, 'register', config, injector)

def db_job(injector: Injector):
    def wrapper(fn):
        def decorated(*args, **kwargs):
            try:
                return fn(*args, **kwargs)
            finally:
                SessionLocal = injector.get(DBSession)
                SessionLocal.remove()
        return decorated
    return wrapper
