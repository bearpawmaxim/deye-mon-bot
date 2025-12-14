from fastapi import Depends
from app.utils.jwt_dependencies import jwt_required


def register(app):

    @app.get('/')
    def index(_ = Depends(jwt_required)):
        return 'Something weird happened if you see this...'
