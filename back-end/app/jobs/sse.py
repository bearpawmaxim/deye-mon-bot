from injector import Injector
from apscheduler.schedulers.background import BackgroundScheduler

from app.config import Config
from shared.services.events.service import EventsService


def register(config: Config, injector: Injector):
    scheduler = injector.get(BackgroundScheduler)

    def send_ping():
        injector.get(EventsService).broadcast_public("ping")

    if config.SSE_PING_INTERVAL > 0:
        scheduler.add_job(
            id      = 'send_ping',
            func    = send_ping,
            trigger = 'interval',
            seconds = config.SSE_PING_INTERVAL,
        )
