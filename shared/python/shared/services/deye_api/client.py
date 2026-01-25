import hashlib
from dataclasses import dataclass
from typing import Any
import aiohttp
from aiohttp import ClientSession


@dataclass(frozen=True)
class DeyeCredentials:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str


class BaseDeyeClient:
    """Framework-agnostic Deye API client."""

    def __init__(self, creds: DeyeCredentials, session: ClientSession | None = None):
        self._creds = creds
        self._session = session
        self._owns_session = session is None
        self._token: str | None = None

    async def init(self):
        if self._session is None:
            self._session = aiohttp.ClientSession()
        self._token = await self._get_token()

    async def shutdown(self):
        if self._owns_session and self._session:
            await self._session.close()

    async def _get_token(self) -> str | None:
        url = f"{self._creds.base_url}/account/token?appId={self._creds.app_id}"
        password_hash = hashlib.sha256(self._creds.password.encode("utf-8")).hexdigest()
        payload = {
            "appSecret": self._creds.app_secret,
            "email": self._creds.email,
            "companyId": "0",
            "password": password_hash,
        }
        try:
            async with self._session.post(url, json=payload) as resp:
                resp.raise_for_status()
                data = await resp.json()
                return data.get("accessToken")
        except Exception:
            return None

    async def refresh_token(self):
        self._token = await self._get_token()

    def _set_authorization_token(self, headers: dict, token: str):
        headers["Authorization"] = f"Bearer {token or ''}"

    async def request(self, method: str, endpoint: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        if not self._token:
            await self.refresh_token()

        url = f"{self._creds.base_url}{endpoint}"
        headers = {}
        self._set_authorization_token(headers, self._token)

        for attempt in range(2):
            try:
                async with self._session.request(method, url, json=payload, headers=headers) as resp:
                    if resp.status == 401 and attempt == 0:
                        await self.refresh_token()
                        self._set_authorization_token(headers, self._token)
                        continue
                    resp.raise_for_status()
                    data = await resp.json()

                if (
                    not data.get("success", True)
                    and "token" in str(data.get("msg", "")).lower()
                    and attempt == 0
                ):
                    await self.refresh_token()
                    self._set_authorization_token(headers, self._token)
                    continue
                return data
            except Exception:
                return None
        return None

    async def get_station_list(self, page: int = 1, size: int = 30) -> dict[str, Any] | None:
        return await self.request("POST", "/station/list", {"page": page, "size": size})

    async def get_station_data(self, station_id: int) -> dict[str, Any] | None:
        return await self.request("POST", "/station/latest", {"stationId": station_id})
