from dataclasses import dataclass


class DeyeConfig:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str

    def __init__(self, base_url: str, app_id: str, app_secret: str, email: str, password: str):
        self.base_url = base_url
        self.app_id = app_id
        self.app_secret = app_secret
        self.email = email
        self.password = password

    def __str__(self):
        return (f"DeyeConfig(base_url='{self.base_url}', app_id='{self.app_id}', "
                f"app_secret='***', email='{self.email}', password='***')")

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
