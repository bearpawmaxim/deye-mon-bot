from app.services import Services


def register(app, services: Services):
    scheduler = services.scheduler
    scheduler.add_job(
        'check_deye_status',
        check_deye_status,
        trigger='interval',
        seconds=60,
        args=[services]
    )
    scheduler.add_job(
        'refresh_deye_token',
        refresh_deye_token,
        trigger='cron',
        hour='0',
        minute='0',
        second='0',
        args=[services]
    )

def check_deye_status(services: Services):
    with services.scheduler.app.app_context():
        stations = services.deye_api.get_station_list()
        for station in stations.station_list:
            station_data = services.deye_api.get_station_data(station.id)
            services.database.update_station(station.id, station, station_data)
        services.db.session.commit()

def refresh_deye_token(services: Services):
    services.deye_api.refresh_token()