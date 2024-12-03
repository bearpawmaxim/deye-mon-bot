from datetime import datetime, timedelta
from app.services.database.service import DatabaseService
from app.services.deye_api.service import DeyeApiService
from app.services.telegram.service import TelegramService
from app.utils import generate_message, get_send_timeout, get_should_send


class BotService:
    def __init__(self, deye_api: DeyeApiService, telegram: TelegramService, database: DatabaseService):
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

    def periodic_send(self):
        stations = self._database.get_stations()
        channels = self._database.get_channels()
        for channel in channels:
            template_data = {'stations': stations}
            if channel.station.station_id is not None:
                station = next((item for item in stations if item.station_id == channel.station.station_id), None)
                template_data['station'] = station

            should_send = get_should_send(channel.should_send_template, template_data)
            timeout = get_send_timeout(channel.timeout_template, template_data)
            message = generate_message(channel.message_template, template_data)

            next_send_time = (channel.last_sent_time or datetime.min) + timedelta(seconds=timeout)

            if should_send and next_send_time <= datetime.now():
                try:
                    self._telegram.send_message(channel.channel_id, message)
                    channel.last_sent_time = datetime.now()
                except Exception as e:
                    print(f"Error sending message: {e}")
