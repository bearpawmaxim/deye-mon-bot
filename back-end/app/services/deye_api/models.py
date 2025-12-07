from injector import inject
from pydantic import BaseModel, ConfigDict, Field

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


class DeyeApiTokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    code: str
    expires_in: str = Field(alias="expiresIn")
    msg: str
    refresh_token: str = Field(alias="refreshToken")
    request_id: str = Field(alias="requestId")
    scope: str
    success: bool
    token_type: str = Field(alias="tokenType")
    uid: int

    model_config = ConfigDict(
        frozen=False,
        populate_by_name=True,
        extra='ignore',
    )

