from app.services import Services


def register(app, services: Services):
    scheduler = services.scheduler
    scheduler.add_job(
        'periodic_send_message',
        periodic_send_message,
        trigger='interval',
        seconds=60,
        args=[services]
    )

def periodic_send_message(services: Services):
    with services.scheduler.app.app_context():
        services.bot.periodic_send()
        services.db.session.commit()
