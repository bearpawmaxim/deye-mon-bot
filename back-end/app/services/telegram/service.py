import requests

from .models import TelegramConfig


class TelegramService:
    def _get_method_url(self, method: str):
        return 'https://api.telegram.org/bot' + self._token + '/' + method

    def _register_hook(self):
        url = self._get_method_url('setWebhook')
        headers = {
            'Content-Type': 'application/json',
        }
        data = {
            'url': self._hook_base_url + 'api/tg_callback',
        }
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()

            response_data = response.json()
            return response_data['ok'] == True and response_data['result'] == True
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None

    def __init__(self, config: TelegramConfig):
        self._token = config.bot_token
        self._hook_base_url = config.hook_base_url
        self._register_hook()

    def send_message(self, chat_id, text):
        url = self._get_method_url('sendMessage')
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'markdown'
        }
        try:
            response = requests.post(url, data=data)
            response.raise_for_status()
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None
