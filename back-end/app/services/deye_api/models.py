from dataclasses import dataclass


class DeyeConfig:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str
    sync_stations_on_poll: bool

    def __init__(self, base_url: str, app_id: str, app_secret: str, email: str, password: str, sync_stations_on_poll: bool):
        self.base_url = base_url
        self.app_id = app_id
        self.app_secret = app_secret
        self.email = email
        self.password = password
        self.sync_stations_on_poll = sync_stations_on_poll

    def __str__(self):
        return (f"DeyeConfig(base_url='{self.base_url}', app_id='{self.app_id}', "
                f"app_secret='***', email='{self.email}', password='***', sync_stations_on_poll={self.sync_stations_on_poll})")

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
