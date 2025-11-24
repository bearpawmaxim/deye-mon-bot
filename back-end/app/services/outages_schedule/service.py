import string
from pydantic import ValidationError
import requests
from app.services.base import BaseService
from datetime import datetime, timezone, timedelta
from .models import SchedulesResponse, DayStatus

class OutagesScheduleService(BaseService):

    def __init__(self, events):
        super().__init__(events)
        self._cache = {}

    def get_schedule(self, queue: string):
        schedule = self._cache.root.get(queue)
        return schedule


    def update(self, region: int, dso: int):
        yasno_url = f"https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/{region}/dsos/{dso}/planned-outages"
        try:
            response = requests.get(
                yasno_url,
                timeout=10,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                }
            )

            if not response.ok:
                print(f"Failed to fetch data from YASNO API. Status: {response.status_code}")
                return None

            data = response.json()
            parsed = SchedulesResponse.model_validate(data)
            
            # Validate dates from YASNO API
            now = datetime.now(timezone.utc)
            for unit in parsed.root.values():
                if unit.today.date.date() != now.date():
                    unit.today.status = DayStatus.WaitingForSchedule
                if unit.tomorrow.date.date() != (now.date() + timedelta(days=1)):
                    unit.tomorrow.status = DayStatus.WaitingForSchedule

            self._cache = parsed
            self.broadcast_public("outages_updated")

        except requests.exceptions.Timeout:
            print("Request to YASNO API timed out")
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch data from YASNO API: {str(e)}")
            return None

        except ValidationError as ve:
            print(repr(ve.errors()[0]['type']))

        except Exception as e:
            print(f"Internal server error: {str(e)}")
            return None