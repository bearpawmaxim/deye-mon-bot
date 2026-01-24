from datetime import datetime, timedelta
from injector import Injector
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.settings import Settings
from app.services import StationsService


def register(settings: Settings, injector: Injector):
    scheduler = injector.get(AsyncIOScheduler)

    async def sync_stations():
        stations: StationsService = injector.get(StationsService)
        await stations.sync_stations()

    async def sync_stations_data():
        stations: StationsService = injector.get(StationsService)
        await stations.sync_stations_data()

    async def check_deye_status():
        if settings.DEYE_SYNC_STATIONS_ON_POLL:
            await sync_stations()

            run_at = datetime.now() + timedelta(seconds=10)
            job_id = f"check_deye_continue_{int(run_at.timestamp())}"
            scheduler.add_job(
                id       = job_id,
                func     = sync_stations_data,
                trigger  = 'date',
                run_date = run_at,
            )
            return

        await sync_stations_data()

    scheduler.add_job(
        id            = 'check_deye_status',
        func          = check_deye_status,
        trigger       = 'interval',
        next_run_time = datetime.now(),
        seconds       = int(settings.DEYE_FETCH_INTERVAL),
    )
    if not settings.DEYE_SYNC_STATIONS_ON_POLL:
        scheduler.add_job(
            id            = 'sync_deye_stations',
            func          = sync_stations,
            trigger       = 'cron',
            hour          = '*/3',
            minute        = '0',
            second        = '0',
            next_run_time = datetime.now()
        )
