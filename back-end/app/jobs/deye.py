from datetime import datetime, timedelta
from injector import Injector
from apscheduler.schedulers.background import BackgroundScheduler

from app.config import Config
from app.services import DeyeApiService, DatabaseService
from shared.services.events.service import EventsService
from . import db_job

def register(config: Config, injector: Injector):
    scheduler = injector.get(BackgroundScheduler)

    @db_job(injector)
    def sync_deye_stations():
        deye_api: DeyeApiService = injector.get(DeyeApiService)
        database: DatabaseService = injector.get(DatabaseService)
        stations = deye_api.get_station_list()
        if stations is None:
            return
        for station in stations.station_list:
            database.add_station(station)
        database.save_changes()

    @db_job(injector)
    def _check_deye_status():
        deye_api: DeyeApiService = injector.get(DeyeApiService)
        database: DatabaseService = injector.get(DatabaseService)
        events: EventsService = injector.get(EventsService)
        stations = database.get_stations()
        for station in stations:
            if not station.enabled:
                continue

            station_data = deye_api.get_station_data(station.station_id)
            if station_data is None:
                continue
            database.add_station_data(station.station_id, station_data)
        database.save_changes()
        events.broadcast_public("station_data_updated")

    
    @db_job(injector)
    def check_deye_status():
        config: Config = injector.get(Config)
        deye_api: DeyeApiService = injector.get(DeyeApiService)
        database: DatabaseService = injector.get(DatabaseService)
        events: EventsService = injector.get(EventsService)
        if config.DEYE_SYNC_STATIONS_ON_POLL:
            sync_deye_stations()
            database.save_changes()

            run_at = datetime.now() + timedelta(seconds=10)
            job_id = f"check_deye_continue_{int(run_at.timestamp())}"
            scheduler.add_job(
                id       = job_id,
                func     = _check_deye_status,
                trigger  = 'date',
                run_date = run_at,
            )
            return

        _check_deye_status(deye_api, database, events)


    def refresh_deye_token():
        deye_api: DeyeApiService = injector.get(DeyeApiService)
        deye_api.refresh_token()

    @db_job(injector)
    def remove_old_data():
        database: DatabaseService = injector.get(DatabaseService)
        try:
            scheduler.pause()
            database.delete_old_station_data()
            database.delete_old_ext_data()
            database.save_changes()
        finally:
            scheduler.resume()


    scheduler.add_job(
        id      = 'check_deye_status',
        func    = check_deye_status,
        trigger = 'interval',
        seconds = int(config.DEYE_FETCH_INTERVAL),
    )
    if not config.DEYE_SYNC_STATIONS_ON_POLL:
        scheduler.add_job(
            id      = 'sync_deye_stations',
            func    = sync_deye_stations,
            trigger = 'cron',
            hour    = '*/3',
            minute  = '0',
            second  = '0',
        )
    scheduler.add_job(
        id      = 'refresh_deye_token',
        func    = refresh_deye_token,
        trigger = 'cron',
        hour    = '0',
        minute  = '0',
        second  = '0',
    )
    scheduler.add_job(
        id      = 'remove_old_data',
        func    = remove_old_data,
        trigger = 'cron',
        hour    = '0',
        minute  = '10',
        second  = '0',
    )
