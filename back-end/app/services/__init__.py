from apscheduler.schedulers.background import BackgroundScheduler
from concurrent.futures import ThreadPoolExecutor
from injector import Injector, inject

from .bot import BotService
from .beanie_initializer import BeanieInitializer
from .database import DatabaseService
from .deye_api import DeyeConfig, DeyeApiService
from .telegram import TelegramConfig, TelegramService
from .visit_counter import VisitCounterService
from .outages_schedule import OutagesScheduleService
from shared.services import EventsService, EventItem
from .users import UsersService
from .container import ServicesContainer
from .authorization import AuthorizationService


@inject
class Services:
    authorization: AuthorizationService
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: BackgroundScheduler
    database: DatabaseService
    bot: BotService
    executor: ThreadPoolExecutor
    visit_counter: VisitCounterService
    outages_schedule: OutagesScheduleService
    events: EventsService
    users: UsersService
    injector: Injector

    def __init__(
        self,
        authorization: AuthorizationService,
        deye_api: DeyeApiService,
        telegram: TelegramService,
        scheduler: BackgroundScheduler,
        database: DatabaseService,
        bot: BotService,
        executor: ThreadPoolExecutor,
        visit_counter: VisitCounterService,
        outages_schedule: OutagesScheduleService,
        events: EventsService,
        users: UsersService,
        injector: Injector
    ):
        self.authorization = authorization
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
        self.users = users


__all__ = [Services, BeanieInitializer, DatabaseService, BotService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService, ServicesContainer,
           AuthorizationService, VisitCounterService, EventsService, EventItem,
           OutagesScheduleService]