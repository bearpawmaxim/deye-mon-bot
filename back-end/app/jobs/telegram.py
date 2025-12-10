from injector import Injector
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.settings import Settings
from app.services import BotsService, TelegramService

def register(settings: Settings, injector: Injector):

    async def periodic_send_message():
        bots: BotsService = injector.get(BotsService)
        telegram: TelegramService = injector.get(TelegramService)

        await bots.periodic_send()
        ...

    scheduler = injector.get(AsyncIOScheduler)
    scheduler.add_job(
        id      = 'periodic_send_message',
        func    = periodic_send_message,
        trigger = 'interval',
        seconds = 60,
    )
