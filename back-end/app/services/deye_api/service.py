import hashlib
from injector import inject
import aiohttp
from aiohttp import ClientSession

from app.models.deye import DeyeStationList, DeyeStationData
from .models import DeyeApiTokenResponse, DeyeConfig


@inject
class DeyeApiService:
    def __init__(self, config: DeyeConfig, session: ClientSession | None = None):
        self._app_id = config.app_id
        self._app_secret = config.app_secret
        self._email = config.email
        self._password = config.password
        self._base_url = config.base_url

        self._session = session or aiohttp.ClientSession()
        self._token = None

    async def init(self):
        self._token = await self._get_token()

    async def shutdown(self):
        await self._session.close()

    async def _get_token(self) -> str | None:
        url = f"{self._base_url}/account/token?appId={self._app_id}"
        password_hash = hashlib.sha256(self._password.encode("utf-8")).hexdigest()

        payload = {
            "appSecret": self._app_secret,
            "email": self._email,
            "companyId": "0",
            "password": password_hash,
        }

        try:
            async with self._session.post(url, json=payload) as resp:
                resp.raise_for_status()
                data = await resp.json()
                token = DeyeApiTokenResponse.model_validate(data).access_token
                return token
        except aiohttp.ClientResponseError as err:
            print(f"HTTP error during token retrieval: {err}")
        except Exception as err:
            print(f"Other error during token retrieval: {err}")

        return None

    async def refresh_token(self):
        self._token = await self._get_token()

    async def _request_with_auto_refresh(self, method: str, endpoint: str, json: dict):
        url = f"{self._base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self._token or ''}"}

        for attempt in range(2):
            try:
                async with self._session.request(method, url, json=json, headers=headers) as resp:
                    if resp.status == 401 and attempt == 0:
                        await self.refresh_token()
                        headers["Authorization"] = f"Bearer {self._token or ''}"
                        continue

                    resp.raise_for_status()
                    data = await resp.json()

                if (
                    not data.get("success", True)
                    and "token" in data.get("msg", "").lower()
                    and attempt == 0
                ):
                    await self.refresh_token()
                    headers["Authorization"] = f"Bearer {self._token or ''}"
                    continue

                return data

            except aiohttp.ClientResponseError as err:
                print(f"HTTP error for {endpoint}: {err}")
                return None
            except Exception as err:
                print(f"Other error for {endpoint}: {err}")
                return None

        return None

    async def get_station_list(self) -> DeyeStationList | None:
        data = await self._request_with_auto_refresh(
            "POST",
            "/station/list",
            {"page": 1, "size": 30},
        )
        if data is None or not data.get("success", False):
            print(f"API error: {data.get('msg') if data else 'No data'}")
            return None
        return DeyeStationList.model_validate(data)

    async def get_station_data(self, station_id: int) -> DeyeStationData | None:
        data = await self._request_with_auto_refresh(
            "POST",
            "/station/latest",
            {"stationId": station_id},
        )
        if data is None or not data.get("success", False):
            print(f"API error: {data.get('msg') if data else 'No data'}")
            return None
        return DeyeStationData.model_validate(data)
