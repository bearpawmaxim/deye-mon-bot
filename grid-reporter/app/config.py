from dataclasses import dataclass
from typing import Any

from shared.services.deye_api import DeyeCredentials


@dataclass(frozen=True)
class ClientConfig:
    client_id: str
    station_id: int
    deye: DeyeCredentials
    poll_interval: int | None = None
    ext_data_url: str | None = None
    ext_data_token: str | None = None

    @staticmethod
    def from_dict(data: dict[str, Any], defaults: dict[str, Any]) -> "ClientConfig":
        deye = data.get("deye", data)
        poll_interval = data.get("poll_interval")
        if poll_interval is not None:
            poll_interval = int(poll_interval)

        base_url = str(deye.get("base_url") or defaults["deye_base_url"] or "")
        app_id = str(deye.get("app_id") or "")
        app_secret = str(deye.get("app_secret") or "")
        email = str(deye.get("email") or "")
        password = str(deye.get("password") or "")

        if not all([base_url, app_id, app_secret, email, password]):
            raise ValueError("Missing DEYE credentials")

        return ClientConfig(
            client_id=str(data["client_id"]),
            station_id=int(data["station_id"]),
            deye=DeyeCredentials(
                base_url=base_url,
                app_id=app_id,
                app_secret=app_secret,
                email=email,
                password=password,
            ),
            poll_interval=poll_interval,
            ext_data_url=data.get("ext_data_url"),
            ext_data_token=data.get("ext_data_token"),
        )
