import hashlib
from injector import inject
import requests
from requests import Response

from app.models.deye import DeyeStationList, DeyeStationData
from .models import DeyeApiTokenResponse, DeyeConfig


@inject
class DeyeApiService:
    def __init__(self, config: DeyeConfig):
        self._app_id = config.app_id
        self._app_secret = config.app_secret
        self._email = config.email
        self._password = config.password
        self._base_url = config.base_url
        self._token = self._get_token()

    def _get_token(self) -> str | None:
        url = f"{self._base_url}/account/token?appId={self._app_id}"
        headers = {'Content-Type': 'application/json'}
        password_hash = hashlib.sha256(self._password.encode('utf-8')).hexdigest()
        payload = {
            "appSecret": self._app_secret,
            "email": self._email,
            "companyId": "0",
            "password": password_hash
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            token_data = DeyeApiTokenResponse.model_validate(data)
            return token_data.access_token
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error during token retrieval: {err}")
        except Exception as err:
            print(f"Other error during token retrieval: {err}")
        return None

    def refresh_token(self):
        self._token = self._get_token()

    def _request_with_auto_refresh(self, method: str, endpoint: str, json: dict) -> dict | None:
        url = f"{self._base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self._token or ""}'
        }

        for attempt in range(2):
            try:
                response: Response = requests.request(method, url, headers=headers, json=json)
                response.raise_for_status()
                data = response.json()

                if not data.get('success', True) and 'token' in data.get('msg', '').lower() and attempt == 0:
                    self.refresh_token()
                    headers['Authorization'] = f'Bearer {self._token or ""}'
                    continue

                return data
            except requests.exceptions.HTTPError as err:
                if response.status_code == 401 and attempt == 0:
                    self.refresh_token()
                    headers['Authorization'] = f'Bearer {self._token or ""}'
                    continue
                print(f"HTTP error for {endpoint}: {err}")
                return None
            except Exception as err:
                print(f"Other error for {endpoint}: {err}")
                return None
        return None

    def get_station_list(self) -> DeyeStationList | None:
        data = self._request_with_auto_refresh("POST", "/station/list", {"page": 1, "size": 30})
        if data is None:
            return None
        if not data.get('success', False):
            print(f"API error: {data.get('msg')}")
            return None
        return DeyeStationList.model_validate(data)

    def get_station_data(self, station_id: int) -> DeyeStationData | None:
        data = self._request_with_auto_refresh("POST", "/station/latest", {"stationId": station_id})
        if data is None:
            return None
        if not data.get('success', False):
            print(f"API error: {data.get('msg')}")
            return None
        return DeyeStationData.model_validate(data)
