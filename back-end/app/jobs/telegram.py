from injector import Injector
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.settings import Settings
from app.services import BotService, DatabaseService
from . import db_job

def register(settings: Settings, injector: Injector):

    @db_job(injector)
    def periodic_send_message():
        bot: BotService = injector.get(BotService)
        database: DatabaseService = injector.get(DatabaseService)

        bot.periodic_send()
        database.save_changes()


    scheduler = injector.get(AsyncIOScheduler)
    scheduler.add_job(
        id      = 'periodic_send_message',
        func    = periodic_send_message,
        trigger = 'interval',
        seconds = 60,
    )
