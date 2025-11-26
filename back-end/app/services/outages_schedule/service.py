import string
from pydantic import ValidationError
import requests
from app.services.base import BaseService
from datetime import datetime, timezone, timedelta
from .models import SchedulesResponse, DayStatus

class OutagesScheduleService(BaseService):

    def __init__(self, events):
        super().__init__(events)
        self._cache = SchedulesResponse({})

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
            
            transformed_data = {}
            for queue, unit_data in data.items():
                days_list = []
                if 'today' in unit_data:
                    days_list.append(unit_data['today'])
                if 'tomorrow' in unit_data:
                    days_list.append(unit_data['tomorrow'])
                
                transformed_data[queue] = {
                    'days': days_list,
                    'updatedOn': unit_data.get('updatedOn')
                }
            
            parsed = SchedulesResponse.model_validate(transformed_data)
            
            now = datetime.now(timezone.utc)
            for unit in parsed.root.values():
                for day in unit.days:
                    day_date = day.date.replace(tzinfo=timezone.utc) if day.date.tzinfo is None else day.date.astimezone(timezone.utc)
                    days_diff = abs((day_date.date() - now.date()).days)
                    if days_diff > 2:
                        day.status = DayStatus.WaitingForSchedule

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