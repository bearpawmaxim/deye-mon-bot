from injector import Injector
from apscheduler.schedulers.background import BackgroundScheduler

from app.settings import Settings
from shared.services.events.service import EventsService


def register(settings: Settings, injector: Injector):
    scheduler = injector.get(BackgroundScheduler)

    def send_ping():
        injector.get(EventsService).broadcast_public("ping")

    if settings.SSE_PING_INTERVAL > 0:
        scheduler.add_job(
            id      = 'send_ping',
            func    = send_ping,
            trigger = 'interval',
            seconds = settings.SSE_PING_INTERVAL,
        )
