from datetime import timedelta
import os
from dotenv import load_dotenv
from shared.utils import generate_secret_key


base_path = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(base_path, '../../.env'))
load_dotenv(dotenv_path=env_path)

class Config:
    SCHEDULER_API_ENABLED = True
    basedir = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY  = os.getenv('SECRET_KEY', None)
    if not SECRET_KEY:
        SECRET_KEY = generate_secret_key(32)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    sqlite_path = os.path.abspath(os.path.join(basedir, '../', 'db.sqlite3'))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + sqlite_path
    print(f"db path={SQLALCHEMY_DATABASE_URI}")

    DEYE_BASE_URL = os.getenv('DEYE_BASE_URL')
    DEYE_APP_ID = os.getenv('DEYE_APP_ID')
    DEYE_APP_SECRET = os.getenv('DEYE_APP_SECRET')
    DEYE_EMAIL = os.getenv('DEYE_EMAIL')
    DEYE_PASSWORD = os.getenv('DEYE_PASSWORD')
    DEYE_FETCH_INTERVAL = os.getenv('DEYE_FETCH_INTERVAL', default=120)
    DEYE_SYNC_STATIONS_ON_POLL = os.getenv('DEYE_SYNC_STATIONS_ON_POLL', 'False').lower() in ('true', '1', 't', 'yes')

    TG_BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
    TG_HOOK_BASE_URL = os.getenv('TG_HOOK_BASE_URL')

    BOT_TIMEZONE = os.getenv('BOT_TIMEZONE', 'utc')

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        JWT_SECRET_KEY = generate_secret_key(64)

    JWT_TOKEN_LOCATION = ["headers", "query_string"]
    JWT_QUERY_STRING_NAME = "token"

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 3600 * 24))
    )

    ADMIN_USER = os.getenv('ADMIN_USER')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

    REDIS_URL = os.getenv('REDIS_URL')

    HOST = '127.0.0.1'

    STATISTIC_KEEP_DAYS = int(os.getenv('STATISTIC_KEEP_DAYS', 3))

    IS_MIGRATION_RUN = False

    SSE_PING_INTERVAL = int(os.getenv('SSE_PING_INTERVAL', 45))

    DEBUG = False

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
