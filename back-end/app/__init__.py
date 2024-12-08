from flask import Flask
from app.config import Config
from app.jobs import register_jobs
from app.routes import register_routes
from app.services import Services, initialize_services
from app.models import Base

def setup_services(config: Config) -> Services:
    return initialize_services(config)

def register_extensions(app, services: Services):
    with app.app_context():
        services.db.init_app(app)
        Base.metadata.create_all(bind=services.db.engine)
    services.authorization.init_app(app)
    if services.scheduler is not None:
        services.scheduler.init_app(app)
        services.scheduler.start()

def create_user(app, config, services: Services):
    with app.app_context():
        services.authorization.add_user(config.ADMIN_USER, config.ADMIN_PASSWORD)
        services.db.session.commit()

def create_app(config, services: Services):
    app = Flask(__name__)
    app.config.from_object(config)
    register_extensions(app, services)
    if services.scheduler is not None:
        register_routes(app, services)
        register_jobs(app, services)
    create_user(app, config, services)
    return app
