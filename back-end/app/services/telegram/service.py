import logging
from beanie import PydanticObjectId
from injector import inject
import aiohttp
from aiohttp import ClientSession

from .models import TelegramChatInfo, TelegramConfig, TelegramUserInfo


logger = logging.getLogger(__name__)


@inject
class TelegramService:
    def __init__(self, config: TelegramConfig, session: ClientSession | None = None):
        self._hook_base_url = config.hook_base_url
        self._bot_tokens = {}
        self._session = session or aiohttp.ClientSession()

    async def shutdown(self):
        await self._session.close()

    def _get_method_url(self, token: str, method: str):
        return f"https://api.telegram.org/bot{token}/{method}"

    async def add_bot(self, id: PydanticObjectId, token: str, enable_hook: bool):
        hook_url = f"{self._hook_base_url}api/tg/callback/{id}"
        if id not in self._bot_tokens:
            self._bot_tokens[id] = token

        if enable_hook:
            await self.register_hook(token, hook_url)
        else:
            await self.unregister_hook(token)

    async def remove_bot(self, id: PydanticObjectId):
        if id not in self._bot_tokens:
            return
        token = self._bot_tokens.pop(id)
        await self.unregister_hook(token)

    async def register_hook(self, bot_token: str, hook_url: str):
        url = self._get_method_url(bot_token, "setWebhook")
        data = {"url": hook_url}

        try:
            async with self._session.post(url, json=data) as resp:
                resp.raise_for_status()
                js = await resp.json()
                return js.get("ok") and js.get("result")
        except aiohttp.ClientResponseError as err:
            logger.error(f"HTTP error occurred during webhook registration: {err}")
        except Exception as err:
            logger.error(f"Other error during webhook registration: {err}")
        return None

    async def unregister_hook(self, bot_token: str):
        url = self._get_method_url(bot_token, "deleteWebhook")

        try:
            async with self._session.post(url) as resp:
                resp.raise_for_status()
                js = await resp.json()
                return js.get("ok") and js.get("result")
        except aiohttp.ClientResponseError as err:
            logger.error(f"HTTP error occurred during webhook removal: {err}")
        except Exception as err:
            logger.error(f"Other error during webhook removal: {err}")
        return None

    async def send_message(self, bot_id: PydanticObjectId, chat_id, text: str):
        token = self._bot_tokens[bot_id]
        url = self._get_method_url(token, "sendMessage")

        data = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "markdown"
        }

        try:
            async with self._session.post(url, data=data) as resp:
                resp.raise_for_status()
        except aiohttp.ClientResponseError as err:
            logger.error(f"HTTP error occurred while sending the message: {err}")
        except Exception as err:
            logger.error(f"Other error while sending the message: {err}")
            return None

    async def get_bot_info(self, bot_id: PydanticObjectId):
        token = self._bot_tokens[bot_id]
        url = self._get_method_url(token, "getMe")

        try:
            async with self._session.post(url) as resp:
                resp.raise_for_status()
                js = await resp.json()

            if js.get("ok") and js.get("result"):
                return TelegramUserInfo.from_json(js["result"])
        except aiohttp.ClientResponseError as err:
            logger.error(f"HTTP error occurred during bot info retrieval: {err}")
        except Exception as err:
            logger.error(f"Other error during bot info retrieval: {err}")
        return None

    async def get_chat_info(self, chat_id, bot_id: PydanticObjectId):
        token = self._bot_tokens[bot_id]
        url = self._get_method_url(token, "getChat")

        data = {"chat_id": chat_id}

        try:
            async with self._session.post(url, data=data) as resp:
                resp.raise_for_status()
                js = await resp.json()

            if js.get("ok") and js.get("result"):
                return TelegramChatInfo.from_json(js["result"])
        except aiohttp.ClientResponseError as err:
            logger.error(f"HTTP error occurred during chat info retrieval: {err}")
        except Exception as err:
            logger.error(f"Other error during chat info retrieval: {err}")
        return None
