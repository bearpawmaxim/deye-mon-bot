from dataclasses import dataclass

from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler

from app.config import Config
from .bot import BotConfig, BotService
from .database import DatabaseService
from .deye_api import DeyeConfig, DeyeApiService
from .telegram import TelegramConfig, TelegramService

class Services:
    db: SQLAlchemy
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: APScheduler
    database: DatabaseService
    bot: BotService

    def __init__(self, db: SQLAlchemy, deye_api: DeyeApiService = None, telegram: TelegramService = None, scheduler: APScheduler = None, database: DatabaseService = None, bot: BotService = None):
        self.db = db
        self.deye_api = deye_api
        self.telegram = telegram
        self.scheduler = scheduler
        self.database = database
        self.bot = bot

    @classmethod
    def minimal(cls, db: SQLAlchemy):
        return cls(db)

    @classmethod
    def full(cls, db: SQLAlchemy, deye_api: DeyeApiService, telegram: TelegramService, scheduler: APScheduler, database: DatabaseService, bot: BotService):
        return cls(db, deye_api, telegram, scheduler, database, bot)

def initialize_services(config: Config):
    db = SQLAlchemy()

    if config.IS_FLASK_MIGRATION_RUN:
        print('not initializing services')
        return Services.minimal(db = db)

    scheduler = APScheduler()

    deye_api_config = DeyeConfig(
        app_id = config.DEYE_APP_ID,
        app_secret = config.DEYE_APP_SECRET,
        base_url = config.DEYE_BASE_URL,
        email = config.DEYE_EMAIL,
        password = config.DEYE_PASSWORD
    )
    print(deye_api_config)
    deye_api = DeyeApiService(deye_api_config)

    telegram_config = TelegramConfig(
        bot_token = config.TG_BOT_TOKEN,
        hook_base_url = config.TG_HOOK_BASE_URL
    )
    print(telegram_config)
    telegram = TelegramService(telegram_config)

    database = DatabaseService(db)

    bot_config = BotConfig(config.BOT_TIMEZONE)
    print(bot_config)
    bot = BotService(bot_config, deye_api, telegram, database)

    return Services.full(
        db = db,
        deye_api = deye_api,
        telegram = telegram,
        scheduler = scheduler,
        database = database,
        bot = bot
    )

__all__ = [Services, DatabaseService, BotService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService]