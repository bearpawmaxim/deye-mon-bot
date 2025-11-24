from flask_executor import Executor
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler

from app.config import Config
from .bot import BotConfig, BotService
from .database import DatabaseConfig, DatabaseService
from .deye_api import DeyeConfig, DeyeApiService
from .telegram import TelegramConfig, TelegramService
from .authorization import AuthorizationService
from .visit_counter import VisitCounterService
from .outages_schedule import OutagesScheduleService
from .events import EventsService, EventItem

class Services:
    db: SQLAlchemy
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: APScheduler
    database: DatabaseService
    bot: BotService
    authorization: AuthorizationService
    executor: Executor
    visit_counter: VisitCounterService
    outages_scgedule: OutagesScheduleService
    events: EventsService

    def __init__(
        self,
        db: SQLAlchemy,
        deye_api: DeyeApiService,
        telegram: TelegramService,
        scheduler: APScheduler,
        database: DatabaseService,
        bot: BotService,
        authorization: AuthorizationService,
        executor: Executor,
        visit_counter: VisitCounterService,
        outages_scgedule: OutagesScheduleService,
        events: EventsService
    ):
        self.db = db
        self.deye_api = deye_api
        self.telegram = telegram
        self.scheduler = scheduler
        self.database = database
        self.bot = bot
        self.authorization = authorization
        self.executor = executor
        self.visit_counter = visit_counter
        self.outages_scgedule = outages_scgedule
        self.events = events


def initialize_services(config: Config):
    db = SQLAlchemy()

    scheduler = APScheduler()
    events = EventsService()

    deye_api_config = DeyeConfig(
        app_id = config.DEYE_APP_ID,
        app_secret = config.DEYE_APP_SECRET,
        base_url = config.DEYE_BASE_URL,
        email = config.DEYE_EMAIL,
        password = config.DEYE_PASSWORD,
        sync_stations_on_poll = config.DEYE_SYNC_STATIONS_ON_POLL
    )
    print(deye_api_config)
    deye_api = DeyeApiService(deye_api_config)

    telegram_config = TelegramConfig(
        hook_base_url = config.TG_HOOK_BASE_URL
    )
    print(telegram_config)
    telegram = TelegramService(telegram_config)

    database_config = DatabaseConfig(
        db = db,
        statistic_keep_days = config.STATISTIC_KEEP_DAYS
    )
    print(database_config)
    database = DatabaseService(database_config)

    bot_config = BotConfig(config.BOT_TIMEZONE)
    print(bot_config)
    bot = BotService(bot_config, deye_api, telegram, database, events)

    authorization = AuthorizationService(database)

    executor = Executor()

    visit_counter = VisitCounterService(db, events)
    outages_schedule = OutagesScheduleService(events)

    return Services(
        db = db,
        deye_api = deye_api,
        telegram = telegram,
        scheduler = scheduler,
        database = database,
        bot = bot,
        authorization = authorization,
        executor = executor,
        visit_counter = visit_counter,
        outages_scgedule = outages_schedule,
        events = events
    )

__all__ = [Services, AuthorizationService, DatabaseService, BotService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService, VisitCounterService, EventsService, EventItem]