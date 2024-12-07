from datetime import datetime, timedelta, timezone
from functools import partial
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from app.services.database.service import DatabaseService
from app.services.deye_api.service import DeyeApiService
from app.services.telegram.service import TelegramService
from app.utils import generate_message, get_send_timeout, get_should_send
from .models import BotConfig

class BotService:
    def _try_get_timezone(self, timezone: str):
        try:
            return ZoneInfo(timezone)
        except ZoneInfoNotFoundError:
            print(f'Cannot get timezone {timezone}, falling back to UTC')
            return ZoneInfo('utc')

    def __init__(self, config: BotConfig, deye_api: DeyeApiService, telegram: TelegramService, database: DatabaseService):
        self._message_timezone = self._try_get_timezone(config.timezone)
        self._deye_api = deye_api
        self._telegram = telegram
        self._database = database

    def update(self, message):
        if 'message' in message:
            chat_id = message["message"]["chat"]["id"]
            if (self._database.get_is_chat_allowed(chat_id)):
                text = message['message']['text']
                self._telegram.send_message(chat_id, f"pong '{text}'")
            else:
                print(f'request from not allowed chat {chat_id}')

    def _populate_stations_data(self, template_data, stations, channel):
        for station in stations:
            data = self._database.get_station_data(station.station_id)
            station_data = {
                **data,
                'name': station.station_name,
                'grid_interconnection_type': station.grid_interconnection_type,
                'connection_status': station.connection_status
            }
            template_data['stations'].append(station_data)

            if channel.station_id == station.id:
                template_data['station'] = station_data

    def _add_average_methods(self, template_data, last_sent_time):
        for station_data in template_data['stations']:
            station_data['get_average'] = partial(
                self._database.get_station_data_average_column,
                last_sent_time,
                datetime.now(timezone.utc),
                station_data['current'].station_id
            )
        if 'station' in template_data and template_data['station'] is not None:
            template_data['station']['get_average'] = partial(
                self._database.get_station_data_average_column,
                last_sent_time,
                datetime.now(timezone.utc),
                template_data['station']['current'].station_id
            )

    def _send_message(self, channel, template_data):
        try:
            message = generate_message(channel.message_template, template_data)
            self._telegram.send_message(channel.channel_id, message)
            channel.last_sent_time = datetime.now(timezone.utc)
        except Exception as e:
            print(f"Error sending message: {e}")

    def periodic_send(self):
        stations = self._database.get_stations()
        channels = self._database.get_channels()

        for channel in channels:
            template_data = {
                'stations': [],
                'strftime': datetime.now(self._message_timezone).strftime
            }
            self._populate_stations_data(template_data, stations, channel)
            self._add_average_methods(template_data, channel.last_sent_time)

            timeout = get_send_timeout(channel.timeout_template, template_data)
            template_data['timeout'] = timeout
            should_send = get_should_send(channel.should_send_template, template_data)
            next_send_time = (
                (channel.last_sent_time or datetime.min) + timedelta(seconds=timeout)
            ).replace(tzinfo=timezone.utc)

            if should_send and next_send_time <= datetime.now(timezone.utc):
                self._send_message(channel, template_data)
