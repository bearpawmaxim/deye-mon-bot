from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler

from app.config import Config
from .bot import BotConfig, BotService
from .database import DatabaseService
from .deye_api import DeyeConfig, DeyeApiService
from .telegram import TelegramConfig, TelegramService
from .authorization import AuthorizationService

class Services:
    db: SQLAlchemy
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: APScheduler
    database: DatabaseService
    bot: BotService
    authorization: AuthorizationService

    def __init__(
        self,
        db: SQLAlchemy,
        deye_api: DeyeApiService,
        telegram: TelegramService,
        scheduler: APScheduler,
        database: DatabaseService,
        bot: BotService,
        authorization: AuthorizationService
    ):
        self.db = db
        self.deye_api = deye_api
        self.telegram = telegram
        self.scheduler = scheduler
        self.database = database
        self.bot = bot
        self.authorization = authorization


def initialize_services(config: Config):
    db = SQLAlchemy()

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

    authorization = AuthorizationService(database)

    return Services(
        db = db,
        deye_api = deye_api,
        telegram = telegram,
        scheduler = scheduler,
        database = database,
        bot = bot,
        authorization = authorization
    )

__all__ = [Services, AuthorizationService, DatabaseService, BotService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService]