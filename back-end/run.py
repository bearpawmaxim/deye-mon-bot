# -*- encoding: utf-8 -*-

import os
from sys import exit

from app.config import config_dict
from app import create_app, setup_services

DEBUG = (os.getenv('DEBUG', 'False') == 'True')

get_config_mode = 'Debug' if DEBUG else 'Production'

try:
    app_config = config_dict[get_config_mode.capitalize()]
except KeyError:
    exit('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

services = setup_services(app_config)
app = create_app(app_config, services)

if DEBUG:
    app.logger.info('DEBUG            = ' + str(DEBUG))
    app.logger.info('DBMS             = ' + app_config.SQLALCHEMY_DATABASE_URI)

if __name__ == "__main__":
    app.run(host=app_config.HOST)
