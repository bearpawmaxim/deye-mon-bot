from app.services import Services


def register(app, services: Services):

    @app.route('/')
    def index():
        return 'Something weird happened if you see this...'