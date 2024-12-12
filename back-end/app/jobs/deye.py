from app import Config
from app.services import Services


def register(config: Config, services: Services):
    scheduler = services.scheduler
    scheduler.add_job(
        'check_deye_status',
        check_deye_status,
        trigger = 'interval',
        seconds = int(config.DEYE_FETCH_INTERVAL),
        args = [services]
    )
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

def check_deye_status(services: Services):
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

def refresh_deye_token(services: Services):
    services.deye_api.refresh_token()

def remove_old_data(services: Services):
    with services.scheduler.app.app_context():
        try:
            services.scheduler.pause()
            services.database.delete_old_station_data(3)
            services.db.session.commit()
        finally:
            services.scheduler.resume()