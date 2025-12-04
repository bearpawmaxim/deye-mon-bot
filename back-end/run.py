# -*- encoding: utf-8 -*-

import os
from fastapi import FastAPI
import uvicorn
from sys import exit
from app.config import config_dict
from app.main import create_app

DEBUG = (os.getenv('DEBUG', 'False') == 'True')

get_config_mode = 'Debug' if DEBUG else 'Production'

try:
    app_config = config_dict[get_config_mode]
except KeyError:
    exit('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

app: FastAPI = create_app(app_config)

if DEBUG:
    print('DEBUG            = ' + str(DEBUG))
    print('DBMS             = ' + app_config.SQLALCHEMY_DATABASE_URI)

if __name__ == "__main__":
    uvicorn.run("run:app", host="0.0.0.0", port=5005, reload=True)
