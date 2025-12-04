from fastapi import Depends
from app.services import Services
from app.utils.jwt_dependencies import jwt_required


def register(app, services: Services):

    @app.get('/')
    def index(claims=Depends(jwt_required)):
        return 'Something weird happened if you see this...'