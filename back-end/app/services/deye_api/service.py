import hashlib
from typing import List
import requests

from app.models.deye import DeyeStation, DeyeStationData, DeyeStationList
from .models import DeyeApiTokenResponse, DeyeConfig


class DeyeApiService:
    def __init__(self, config: DeyeConfig):
        self._app_id = config.app_id
        self._app_secret = config.app_secret
        self._email = config.email
        self._password = config.password
        self._base_url = config.base_url
        self._token = self._get_token()

    def _get_token(self):
        url = self._base_url + '/account/token?appId=' + self._app_id
        headers = {
            'Content-Type': 'application/json'
        }
        sha256_hash = hashlib.sha256()
        sha256_hash.update(self._password.encode('utf-8'))
        passwordWith256 = sha256_hash.hexdigest()
        data = {
            "appSecret": self._app_secret,
            "email": self._email,
            "companyId": "0",
            "password": passwordWith256
        }
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()

            data = response.json()
            data = DeyeApiTokenResponse(**data)
            return data.accessToken

        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None

    def refresh_token(self):
        self._token = self.refresh_token()

    def get_station_list(self):
        url = self._base_url + '/station/list'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + self._token
        }
        data = {
            "page": 1,
            "size": 30
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()

            data = response.json()
            if not data['success']:
                raise AssertionError(data['msg'])
            response = DeyeStationList(
                code=data['code'],
                msg=data['msg'],
                request_id=data['requestId'],
                station_list=list(),
                success=data['success'],
                total=data['total']
            )
            for station in data['stationList']:
                station_item = DeyeStation(
                    battery_soc = station['batterySOC'],
                    connection_status = station['connectionStatus'],
                    contact_phone = station['contactPhone'],
                    created_date = station['createdDate'],
                    generation_power = station['generationPower'],
                    grid_interconnection_type = station['gridInterconnectionType'],
                    id = station['id'],
                    installed_capacity = station['installedCapacity'],
                    last_update_time = station['lastUpdateTime'],
                    location_address = station['locationAddress'],
                    location_lat = station['locationLat'],
                    location_lng = station['locationLng'],
                    name = station['name'],
                    owner_name = station['ownerName'],
                    region_nation_id = station['regionNationId'],
                    region_timezone = station['regionTimezone'],
                    start_operating_time = station['startOperatingTime']
                )
                response.station_list.append(station_item)
            return response
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None

    def get_station_data(self, station_id):
        url = self._base_url + '/station/latest'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + self._token
        }
        data = {
            "stationId": station_id
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()

            data = response.json()
            if not data['success']:
                raise AssertionError(data['msg'])

            return DeyeStationData(
                battery_power = data['batteryPower'],
                battery_soc = data['batterySOC'],
                charge_power = data['chargePower'],
                code = data['code'],
                consumption_power = data['consumptionPower'],
                discharge_power = data['dischargePower'],
                generation_power = data['generationPower'],
                grid_power = data['gridPower'],
                irradiate_intensity = data['irradiateIntensity'],
                last_update_time = data['lastUpdateTime'],
                msg = data['msg'],
                purchase_power = data['purchasePower'],
                request_id = data['requestId'],
                success = data['success'],
                wire_power = data['wirePower']
            )
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None
