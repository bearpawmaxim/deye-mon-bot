from dataclasses import dataclass
from injector import inject

from app.settings import Settings


@inject
class DeyeConfig:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str
    sync_stations_on_poll: bool

    def __init__(self, settings: Settings):
        self.base_url = settings.DEYE_BASE_URL
        self.app_id = settings.DEYE_APP_ID
        self.app_secret = settings.DEYE_APP_SECRET
        self.email = settings.DEYE_EMAIL
        self.password = settings.DEYE_PASSWORD
        self.sync_stations_on_poll = settings.DEYE_SYNC_STATIONS_ON_POLL

    def __str__(self):
        return (
            f"DeyeConfig(base_url='{self.base_url}', app_id='{self.app_id}', "
            f"app_secret='***', email='{self.email}', password='***', "
            f"sync_stations_on_poll={self.sync_stations_on_poll})"
        )


@dataclass
class DeyeApiTokenResponse:
    accessToken: str
    code: str
    expiresIn: str
    msg: str
    refreshToken: str
    requestId: str
    scope: str
    success: bool
    tokenType: str
    uid: int
