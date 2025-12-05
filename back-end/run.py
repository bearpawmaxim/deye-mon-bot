# -*- encoding: utf-8 -*-

from app.settings import get_settings, Settings
from app.main import create_app
from fastapi import FastAPI
import uvicorn

settings: Settings = get_settings()

app: FastAPI = create_app(settings)

if settings.DEBUG:
    print("DEBUG            =", settings.DEBUG)
    print("DBMS             =", settings.SQLALCHEMY_DATABASE_URI)

print(settings.model_dump())

if __name__ == "__main__":
    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=5005,
        reload=settings.DEBUG
    )
