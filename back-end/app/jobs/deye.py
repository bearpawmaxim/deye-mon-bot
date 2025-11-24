from datetime import datetime, timedelta
from app import Config
from app.services import Services, EventItem


def register(config: Config, services: Services):
    scheduler = services.scheduler
    scheduler.add_job(
        'check_deye_status',
        check_deye_status,
        trigger = 'interval',
        seconds = int(config.DEYE_FETCH_INTERVAL),
        args    = [config, services]
    )
    if not config.DEYE_SYNC_STATIONS_ON_POLL:
        scheduler.add_job(
            'sync_deye_stations',
            sync_deye_stations,
            trigger = 'cron',
            hour    = '*/3',
            minute  = '0',
            second  = '0',
            args    = [services]
        )
    scheduler.add_job(
        'refresh_deye_token',
        refresh_deye_token,
        trigger = 'cron',
        hour    = '0',
        minute  = '0',
        second  = '0',
        args    = [services]
    )
    scheduler.add_job(
        'remove_old_data',
        remove_old_data,
        trigger = 'cron',
        hour    = '0',
        minute  = '10',
        second  = '0',
        args    = [services]
    )


def sync_deye_stations(services: Services):
    with services.scheduler.app.app_context():
        stations = services.deye_api.get_station_list()
        if stations is None:
            return
        for station in stations.station_list:
            services.database.add_station(station)
        services.db.session.commit()


def _check_deye_status(services: Services):
    with services.scheduler.app.app_context():
        stations = services.database.get_stations()
        for station in stations:
            if not station.enabled:
                continue

            station_data = services.deye_api.get_station_data(station.station_id)
            if station_data is None:
                continue
            services.database.add_station_data(station.station_id, station_data)
        services.db.session.commit()
        services.events.broadcast_public("station_data_updated")


def check_deye_status(config: Config, services: Services):
    with services.scheduler.app.app_context():
        if config.DEYE_SYNC_STATIONS_ON_POLL:
            sync_deye_stations(services)
            services.db.session.commit()

            run_at = datetime.now() + timedelta(seconds=10)
            job_id = f"check_deye_continue_{int(run_at.timestamp())}"
            services.scheduler.add_job(
                job_id,
                _check_deye_status,
                trigger='date',
                run_date=run_at,
                args=[services]
            )
            return

        _check_deye_status(services)


def refresh_deye_token(services: Services):
    services.deye_api.refresh_token()


def remove_old_data(services: Services):
    with services.scheduler.app.app_context():
        try:
            services.scheduler.pause()
            services.database.delete_old_station_data()
            services.database.delete_old_ext_data()
            services.db.session.commit()
        finally:
            services.scheduler.resume()