from injector import Injector
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.settings import Settings
from app.services import MessageProcessorService

def register(_: Settings, injector: Injector):

    async def periodic_send_message():
        message_processor: MessageProcessorService = injector.get(MessageProcessorService)
        await message_processor.periodic_send()

    scheduler = injector.get(AsyncIOScheduler)
    scheduler.add_job(
        id      = 'periodic_send_message',
        func    = periodic_send_message,
        trigger = 'interval',
        seconds = 60,
    )
