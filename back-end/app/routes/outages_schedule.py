import string
from app.services import Services


def register(app, services: Services):

    @app.route('/api/outagesSchedule/outagesSchedule/<queue>', methods=['GET'])
    def get_outages_schedule(queue: string):
        sched = services.outages_scgedule.get_schedule(queue)
        return sched.model_dump_json()
