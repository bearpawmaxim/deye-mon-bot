from apscheduler.schedulers.background import BackgroundScheduler
from concurrent.futures import ThreadPoolExecutor
from injector import Injector, inject

from .bot import BotService
from .database import DatabaseService
from .deye_api import DeyeConfig, DeyeApiService
from .telegram import TelegramConfig, TelegramService
from .visit_counter import VisitCounterService
from .outages_schedule import OutagesScheduleService
from shared.services import EventsService, EventItem

@inject
class Services:
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: BackgroundScheduler
    database: DatabaseService
    bot: BotService
    executor: ThreadPoolExecutor
    visit_counter: VisitCounterService
    outages_schedule: OutagesScheduleService
    events: EventsService
    injector: Injector

    def __init__(
        self,
        deye_api: DeyeApiService,
        telegram: TelegramService,
        scheduler: BackgroundScheduler,
        database: DatabaseService,
        bot: BotService,
        executor: ThreadPoolExecutor,
        visit_counter: VisitCounterService,
        outages_schedule: OutagesScheduleService,
        events: EventsService,
        injector: Injector
    ):
        self.injector = injector
        self.deye_api = deye_api
        self.telegram = telegram
        self.scheduler = scheduler
        self.database = database
        self.bot = bot
        self.executor = executor
        self.visit_counter = visit_counter
        self.outages_schedule = outages_schedule
        self.events = events


__all__ = [Services, DatabaseService, BotService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService,
           VisitCounterService, EventsService, EventItem, OutagesScheduleService]