import requests

from .models import TelegramChatInfo, TelegramConfig, TelegramUserInfo


class TelegramService:
    def _get_method_url(self, bot_token: str, method: str):
        return 'https://api.telegram.org/bot' + bot_token + '/' + method

    def add_bot(self, id: int, token: str):
        if id in self._bot_tokens:
            return
        hook_url = f'{self._hook_base_url}api/tg/callback/{id}'
        self._bot_tokens[id] = token
        self._register_hook(token, hook_url)

    def _register_hook(self, bot_token: str, hook_url: str):
        url = self._get_method_url(bot_token, 'setWebhook')
        headers = {
            'Content-Type': 'application/json',
        }
        data = {
            'url': hook_url
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
        self._hook_base_url = config.hook_base_url
        self._bot_tokens = {}

    def send_message(self, bot_id, chat_id, text):
        bot_token = self._bot_tokens[bot_id]
        url = self._get_method_url(bot_token, 'sendMessage')
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

    def get_bot_info(self, bot_id):
        bot_token = self._bot_tokens[bot_id]
        url = self._get_method_url(bot_token, 'getMe')
        data = {}
        try:
            response = requests.post(url, data=data)
            response.raise_for_status()

            data = response.json()
            if data['ok'] == True and data['result'] is not None:
                return TelegramUserInfo.from_json(data['result'])
            return None
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None
    
    def get_chat_info(self, chat_id, bot_id):
        bot_token = self._bot_tokens[bot_id]
        url = self._get_method_url(bot_token, 'getChat')
        data = {
            'chat_id': chat_id
        }
        try:
            response = requests.post(url, data=data)
            response.raise_for_status()

            data = response.json()
            print(data)
            if data['ok'] == True and data['result'] is not None:
                return TelegramChatInfo.from_json(data['result'])
            return None
        except requests.exceptions.HTTPError as err:
            print(f"HTTP error occurred: {err}")
            return None
        except Exception as err:
            print(f"Other error occurred: {err}")
            return None
