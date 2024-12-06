import os
import random
import string
import sys
from dotenv import load_dotenv

base_path = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(base_path, '../../.env'))
load_dotenv(dotenv_path=env_path)

DB_COMMANDS = {'init', 'migrate', 'upgrade'}

class Config:
    IS_FLASK_MIGRATION_RUN = len(sys.argv) > 2 and sys.argv[1] == 'db' and sys.argv[2] in DB_COMMANDS
    SCHEDULER_API_ENABLED = True
    basedir = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY  = os.getenv('SECRET_KEY', None)
    if not SECRET_KEY:
        SECRET_KEY = ''.join(random.choice(string.ascii_lowercase) for i in range(32))

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    sqlite_path = os.path.abspath(os.path.join(basedir, '../', 'db.sqlite3'))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + sqlite_path

    DEYE_BASE_URL = os.getenv('DEYE_BASE_URL')
    DEYE_APP_ID = os.getenv('DEYE_APP_ID')
    DEYE_APP_SECRET = os.getenv('DEYE_APP_SECRET')
    DEYE_EMAIL = os.getenv('DEYE_EMAIL')
    DEYE_PASSWORD = os.getenv('DEYE_PASSWORD')

    TG_BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
    TG_HOOK_BASE_URL = os.getenv('TG_HOOK_BASE_URL')

    BOT_TIMEZONE = os.getenv('BOT_TIMEZONE', 'utc')

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