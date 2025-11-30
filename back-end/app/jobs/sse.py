from app import Config
from app.services import Services


def register(config: Config, services: Services):
    scheduler = services.scheduler
    if config.SSE_PING_INTERVAL > 0:
        scheduler.add_job(
            'send_ping',
            send_ping,
            trigger = 'interval',
            seconds = config.SSE_PING_INTERVAL,
            args    = [services]
        )

def send_ping(services: Services):
    services.events.broadcast_public("ping")
