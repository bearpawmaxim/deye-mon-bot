import asyncio
from datetime import datetime, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import io
from contextlib import redirect_stdout
from beanie import PydanticObjectId
from injector import inject

from app.repositories import IBotsRepository, IChatsRepository, IMessagesRepository, IStationsDataRepository
from app.services.telegram.service import TelegramService
from app.models.api import BotResponse, CreateBotRequest, UpdateBotRequest
from shared.models import Message, Station
from shared.models.bot import Bot
from shared.services import EventsService
from app.services.base import BaseService
from app.utils import generate_message, get_send_timeout, get_should_send
from .models import BotConfig, MessageItem


@inject
class BotsService(BaseService):
    def _try_get_timezone(self, timezone: str):
        try:
            return ZoneInfo(timezone)
        except ZoneInfoNotFoundError:
            print(f'Cannot get timezone {timezone}, falling back to UTC')
            return ZoneInfo('utc')

    def _run_async(self, coro):
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(coro)
        else:
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result()

    def __init__(
        self,
        config: BotConfig,
        telegram: TelegramService,
        messages: IMessagesRepository,
        bots: IBotsRepository,
        chats: IChatsRepository,
        stations_data: IStationsDataRepository,
        events: EventsService,
    ):
        super().__init__(events)
        self._message_timezone = self._try_get_timezone(config.timezone)
        self._telegram = telegram
        self._messages = messages
        self._bots = bots
        self._chats = chats
        self._stations_data = stations_data


    async def get_enabled_bots(self) -> List[Bot]:
        return await self._bots.get_bots(False)


    async def get_bots(self) -> List[BotResponse]:
        bots = await self._bots.get_bots(True)

        async def process_bot(bot: Bot):
            bot_name = "Invalid bot token"
            try:
                bot_name = (await self._telegram.get_bot_info(bot.id)).username
            except Exception as e:
                print(f"Cannot get bot info for bot {bot.id}: {str(e)}")
            return BotResponse(
                id           = bot.id,
                name         = bot_name,
                token        = bot.token,
                enabled      = bot.enabled,
                hook_enabled = bot.hook_enabled,
            )

        tasks = [
            asyncio.create_task(process_bot(bot))
            for bot in bots
        ]

        return await asyncio.gather(*tasks)


    async def get_bot(self, bot_id: PydanticObjectId) -> Bot:
        return await self._bots.get_bot(bot_id)


    async def create_bot(self, dto: CreateBotRequest):
        print(dto.model_dump())
        bot = await self._bots.create_bot(dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        return bot


    async def update_bot(self, bot_id: PydanticObjectId, dto: UpdateBotRequest):
        bot = await self._bots.update_bot(bot_id, dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        else:
            await self._telegram.remove_bot(bot.id)

        return bot


    async def update(self, bot_id: PydanticObjectId, message):
        if 'message' in message:
            chat_id = message["message"]["chat"]["id"]
            if not (await self._bots.get_is_hook_enabled(bot_id)):
                print(f'hook processing is disabled for bot {bot_id}')
                return
            if (await self._chats.get_is_chat_allowed(chat_id, bot_id)):
                text = message['message']['text']
                await self._telegram.send_message(bot_id, chat_id, f"pong '{text}'")
            else:
                await self._chats.add_chat_request(chat_id, bot_id)
                self.broadcast_private("chats_updated")
                print(f'request from not allowed chat {chat_id}')


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


    async def _send_message(self, message, message_content):
        try:
            await self._telegram.send_message(message.bot.id, message.channel_id, message_content)
            await self._messages.set_last_sent(message.id)
            message.last_sent_time = datetime.now(timezone.utc)
        except Exception as e:
            print(f"Error sending message: {e}")


    async def _prepare_message(self, message: Message, force = False, include_data = False):
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


    async def periodic_send(self):
        messages = await self._messages.get_messages()

        for message in messages:
            try:
                info = await self._prepare_message(message)
                if info is None:
                    continue
                if info.should_send and info.next_send_time <= datetime.now(timezone.utc):
                    await self._send_message(message, info.message)
            except Exception as e:
                print(f"Error sending message '{message.name}': {e}")


    async def get_message(self, message: Message):
        stdout_buffer = io.StringIO()

        info = None
        with redirect_stdout(stdout_buffer):
            info = await self._prepare_message(message, True, True)

        if info is None:
            captured_output = stdout_buffer.getvalue()
            raise Exception(captured_output)

        return info
