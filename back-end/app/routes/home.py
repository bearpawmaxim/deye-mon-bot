from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/')
    @jwt_required()
    def index():
        return 'Something weird happened if you see this...'