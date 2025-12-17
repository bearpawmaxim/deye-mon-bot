from injector import Injector
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.services import MaintenanceService
from app.settings import Settings


def register(settings: Settings, injector: Injector):
    scheduler = injector.get(AsyncIOScheduler)

    async def delete_old_data():
        service = injector.get(MaintenanceService)
        await service.delete_old_data(settings.STATISTIC_KEEP_DAYS)

    scheduler.add_job(
        id      = 'delete_old_data',
        func    = delete_old_data,
        trigger = 'cron',
        hour    = '0',
        minute  = '10',
        second  = '0',
    )
