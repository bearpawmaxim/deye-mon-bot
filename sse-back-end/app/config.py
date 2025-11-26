from datetime import timedelta
import os
from dotenv import load_dotenv
from shared.utils.key_generation import generate_secret_key


base_path = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(base_path, '../../.env'))
load_dotenv(dotenv_path=env_path)

class Config:
    SCHEDULER_API_ENABLED = True
    basedir = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY  = os.getenv('SECRET_KEY', None)
    if not SECRET_KEY:
        SECRET_KEY = generate_secret_key(32)

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise Exception(f"No JWT_SECRET_KEY provided")

    JWT_TOKEN_LOCATION = ["headers", "query_string"]
    JWT_QUERY_STRING_NAME = "token"

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 3600 * 24))
    )

    REDIS_URL = os.getenv('REDIS_URL')

    HOST = '127.0.0.1'

class ProductionConfig(Config):
    DEBUG = False

    # Security
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_DURATION = 3600

class DebugConfig(Config):
    DEBUG = True
    HOST = os.getenv('DEBUG_HOST')

config_dict = {
    'Production': ProductionConfig,
    'Debug'     : DebugConfig
}
