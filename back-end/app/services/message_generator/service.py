from datetime import datetime, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from shared.models import Message
from shared.models.station import Station
from .models import MessageGeneratorConfig, MessageItem
from app.utils import generate_message, get_send_timeout, get_should_send
from app.repositories import IMessagesRepository, IStationsDataRepository


class MessageGeneratorService():
    def _try_get_timezone(self, timezone: str):
        try:
            return ZoneInfo(timezone)
        except ZoneInfoNotFoundError:
            print(f'Cannot get timezone {timezone}, falling back to UTC')
            return ZoneInfo('utc')

    def __init__(
        self,
        config: MessageGeneratorConfig,
        messages: IMessagesRepository,
        stations_data: IStationsDataRepository,
    ):
        self._message_timezone = self._try_get_timezone(config.timezone)
        self._messages = messages
        self._stations_data = stations_data


    async def _populate_stations_data(self, template_data, stations: List[Station], force):
        message_station = None
        for station in stations:
            if not station.enabled and not force:
                continue

            data = await self._stations_data.get_station_data_tuple(station.station_id)

            station_data = {
                **(data.to_dict(self._message_timezone) if data is not None else {}),
                'name': station.station_name,
                'grid_interconnection_type': station.grid_interconnection_type,
                'connection_status': station.connection_status,
                'battery_capacity': station.battery_capacity
            }
            template_data['stations'].append(station_data)

            if len(stations) == 1:
                template_data['station'] = station_data
                message_station = station

        return message_station


    def _get_average_method(self, station_id, start_date = None):
        def sync_wrapper(column_name):
            coro = self._stations_data.get_station_data_average_column(
                start_date,
                datetime.now(timezone.utc),
                station_id,
                column_name
            )
            return self._run_async(coro)
        return sync_wrapper


    def _get_average_minutes_method(self, station_id):
        def sync_wrapper(column_name, minutes):
            coro = self._stations_data.get_station_data_average_column(
                datetime.now(timezone.utc) - timedelta(minutes=minutes),
                datetime.now(timezone.utc),
                station_id,
                column_name
            )
            return self._run_async(coro)
        return sync_wrapper


    def _add_average_methods(self, template_data, last_sent_time):
        for station_data in template_data['stations']:
            if 'current' in station_data:
                station_id = station_data['current']['station_id']
                station_data['get_average'] = self._get_average_method(station_id, last_sent_time)
                station_data['get_average_all'] = self._get_average_method(station_id)
                station_data['get_average_minutes'] = self._get_average_minutes_method(station_id)
        if 'station' in template_data and template_data['station'] is not None and 'current' in template_data['station']:
            station_id = template_data['station']['current']['station_id']
            template_data['station']['get_average'] = self._get_average_method(station_id, last_sent_time)
            template_data['station']['get_average_all'] = self._get_average_method(station_id)
            template_data['station']['get_average_minutes'] = self._get_average_minutes_method(station_id)


    async def generate_message(self, message: Message, force = False, include_data = False) -> MessageItem | None:
        template_data = {
            'stations': [],
            'now': datetime.now(self._message_timezone),
            'timedelta': timedelta,
        }

        if not any(station.enabled for station in message.stations):
            print(f"All stations for message '{message.name}' are disabled")
            return None

        message_station = await self._populate_stations_data(template_data, message.stations, force)
        if len(message.stations) == 1 and message_station is None:
            print(f"The station for message '{message.name}' is disabled")
            return None

        self._add_average_methods(template_data, message.last_sent_time)

        timeout = get_send_timeout(message.timeout_template, template_data)
        template_data['timeout'] = timeout
        should_send = get_should_send(message.should_send_template, template_data)
        next_send_time = (
            (message.last_sent_time or datetime.min) + timedelta(seconds=timeout)
        ).replace(tzinfo=timezone.utc)
        message_content = generate_message(message.message_template, template_data)
        return MessageItem(
            message = message_content,
            should_send = should_send,
            timeout = timeout,
            next_send_time = next_send_time
        )
