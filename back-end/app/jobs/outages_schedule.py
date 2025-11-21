from datetime import datetime
from app import Config
from app.services import Services


def register(config: Config, services: Services):
    scheduler = services.scheduler
    scheduler.add_job(
        'update_outages_schedule',
        update_outages_schedule,
        trigger       = 'interval',
        minutes       = 5,
        args          = [services],
        next_run_time = datetime.now(),
        max_instances = 1
    )

def update_outages_schedule(services: Services):
    with services.scheduler.app.app_context():

        # TODO: fetch from config
        services.outages_scgedule.update(25, 902)
