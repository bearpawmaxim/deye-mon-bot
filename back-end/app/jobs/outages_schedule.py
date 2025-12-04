from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from injector import Injector

from app.config import Config
from app.services import OutagesScheduleService


def register(config: Config, injector: Injector):
    scheduler = injector.get(BackgroundScheduler)

    def update_outages_schedule():
        # TODO: fetch from config
        injector.get(OutagesScheduleService).update(25, 902)

    scheduler.add_job(
        id            = 'update_outages_schedule',
        func          = update_outages_schedule,
        trigger       = 'interval',
        minutes       = 5,
        next_run_time = datetime.now(),
        max_instances = 1
    )
