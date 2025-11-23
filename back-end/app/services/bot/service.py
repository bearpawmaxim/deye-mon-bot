from datetime import datetime, timedelta, timezone
from functools import partial
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from app.services.database.service import DatabaseService
from app.services.deye_api.service import DeyeApiService
from app.services.telegram.service import TelegramService
from app.utils import generate_message, get_send_timeout, get_should_send
from .models import BotConfig, MessageItem

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

    def update(self, bot_id: int, message):
        bot_id = int(bot_id)
        if 'message' in message:
            chat_id = message["message"]["chat"]["id"]
            if not self._database.get_is_hook_enabled(bot_id):
                print(f'hook processing is disabled for bot {bot_id}')
                return
            if self._database.get_is_chat_allowed(chat_id, bot_id):
                text = message['message']['text']
                self._telegram.send_message(bot_id, chat_id, f"pong '{text}'")
            else:
                self._database.add_chat_request(chat_id, bot_id)
                print(f'request from not allowed chat {chat_id}')
            self._database.save_changes()

    def _populate_stations_data(self, template_data, stations, channel, force):
        message_station = None
        for station in stations:
            if not station.enabled and not force:
                continue

            data = self._database.get_station_data_tuple(station.station_id)

            station_data = {
                **(data.to_dict(self._message_timezone) if data is not None else {}),
                'name': station.station_name,
                'grid_interconnection_type': station.grid_interconnection_type,
                'connection_status': station.connection_status,
                'battery_capacity': station.battery_capacity
            }
            template_data['stations'].append(station_data)

            if channel.station_id == station.id:
                template_data['station'] = station_data
                message_station = station
        return message_station

    def _get_average_method(self, station_id, start_date = None):
        return partial(
            self._database.get_station_data_average_column,
            start_date,
            datetime.now(timezone.utc),
            station_id
        )

    def _get_average_minutes_method(self, station_id):
        return (
            lambda column_name,minutes: self._database.get_station_data_average_column(
                datetime.now(timezone.utc) - timedelta(minutes=minutes),
                datetime.now(timezone.utc),
                station_id,
                column_name
            )
        )

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

    def _send_message(self, message, message_content):
        try:
            self._telegram.send_message(message.bot.id, message.channel_id, message_content)
            message.last_sent_time = datetime.now(timezone.utc)
        except Exception as e:
            print(f"Error sending message: {e}")

    def _prepare_message(self, stations, message, force = False, include_data = False):
        template_data = {
            'stations': [],
            'now': datetime.now(self._message_timezone),
            'timedelta': timedelta,
        }
        message_station = self._populate_stations_data(template_data, stations, message, force)
        if message.station_id is not None and message_station is None:
            print(f"message's {message.id} station is disabled")
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

    def periodic_send(self):
        stations = self._database.get_stations()
        messages = self._database.get_messages()

        for message in messages:
            try:
                info = self._prepare_message(stations, message)
                if info is None:
                    continue
                if info.should_send and info.next_send_time <= datetime.now(timezone.utc):
                    self._send_message(message, info.message)
            except Exception as e:
                print(f"Error sending message '{message.name}': {e}")

    def get_message(self, message):
        stations = self._database.get_stations()
        return self._prepare_message(stations, message, True, True)
