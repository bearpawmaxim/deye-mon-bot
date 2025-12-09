from apscheduler.schedulers.asyncio import AsyncIOScheduler
from concurrent.futures import ThreadPoolExecutor
from injector import Injector, inject

from .bots import BotsService
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
from .messages import MessagesService
from .stations import StationsService
from .lookups import LookupsService


@inject
class Services:
    authorization: AuthorizationService
    deye_api: DeyeApiService
    telegram: TelegramService
    scheduler: AsyncIOScheduler
    database: DatabaseService
    bots: BotsService
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
        scheduler: AsyncIOScheduler,
        database: DatabaseService,
        bots: BotsService,
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
        self.bots = bots
        self.executor = executor
        self.visit_counter = visit_counter
        self.outages_schedule = outages_schedule
        self.events = events
        self.users = users


__all__ = [Services, BeanieInitializer, DatabaseService, BotsService, DeyeConfig,
           DeyeApiService, TelegramConfig, TelegramService, ServicesContainer,
           AuthorizationService, VisitCounterService, EventsService, EventItem,
           MessagesService, OutagesScheduleService, StationsService, LookupsService]