from dataclasses import dataclass
from injector import inject

from app.config import Config


@inject
class DeyeConfig:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str
    sync_stations_on_poll: bool

    def __init__(self, config: Config):
        self.base_url = config.DEYE_BASE_URL
        self.app_id = config.DEYE_APP_ID
        self.app_secret = config.DEYE_APP_SECRET
        self.email = config.DEYE_EMAIL
        self.password = config.DEYE_PASSWORD
        self.sync_stations_on_poll = config.DEYE_SYNC_STATIONS_ON_POLL

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
