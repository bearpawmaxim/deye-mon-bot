from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from injector import Injector, inject

from shared.models import Message
from shared.models.station import Station
from .models import MessageGeneratorConfig
from .context import TemplateRequestContext
from app.models import StationStatisticData
from app.utils import generate_message, get_send_timeout, get_should_send
from app.repositories import IMessagesRepository, IStationsDataRepository
from ..interfaces import IMessageGeneratorService, MessageItem
from .requests import (
    AssumedStateRequest,
    AverageMinutesRequest,
    AverageRequest,
)
from .template_method import TemplateMethod, TemplateMethodMode



@dataclass 
class StationTemplateData(StationStatisticData):
    name: str
    grid_interconnection_type: str
    connection_status: str
    battery_capacity: float

    get_average: TemplateMethod
    get_average_all: TemplateMethod
    get_average_minutes: TemplateMethod
    get_assumed_state: TemplateMethod


    def to_dict(self, tz=None, full=False) -> dict:
        result = {
            **super().to_dict(tz),
            'name': self.name,
            'grid_interconnection_type': self.grid_interconnection_type,
            'connection_status': self.connection_status,
            'battery_capacity': self.battery_capacity,
            'previous': self.previous.to_dict(tz) if self.previous else None,
            'current': self.current.to_dict(tz) if self.current else None,
        }
        if full:
            result['get_average'] = self.get_average
            result['get_average_all'] = self.get_average_all
            result['get_average_minutes'] = self.get_average_minutes
            result['get_assumed_state'] = self.get_assumed_state
        return result

@dataclass
class TemplateData:
    timedelta: object
    now: object
    stations: list[StationTemplateData]
    station: StationTemplateData | None
    last_sent_time: datetime | None = None
    timeout: int | None = None

    def to_dict(self, tz=timezone.utc, full=False) -> dict:
        data = {
            'stations': [station.to_dict(tz, full) for station in self.stations],
            'station': self.station.to_dict(tz, full) if self.station else None,
            'last_sent_time': self.last_sent_time.isoformat() if self.last_sent_time else None,
            'timeout': self.timeout,
        }
        if full:
            data['timedelta'] = self.timedelta
            data['now'] = self.now
        return data


@inject
class MessageGeneratorService(IMessageGeneratorService):
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
        injector: Injector,
    ):
        self._message_timezone = self._try_get_timezone(config.timezone)
        self._messages = messages
        self._stations_data = stations_data
        self._injector = injector

    async def _populate_stations_data(self, template_data, stations: List[Station], force):
        message_station = None
        for station in stations:
            if not station.enabled and not force:
                continue

            data = await self._stations_data.get_station_data_tuple(station.station_id)

            station_data = StationTemplateData(
                name = station.station_name,
                grid_interconnection_type = station.grid_interconnection_type,
                connection_status = station.connection_status,
                battery_capacity = station.battery_capacity
                **(data.to_dict(self._message_timezone) if data is not None else {}),
            )
            template_data.stations.append(station_data)

            if len(stations) == 1:
                template_data.station = station_data
                message_station = station

        return message_station

    def _add_methods(
            self,
            template_data,
            last_sent_time,
            mode: TemplateMethodMode,
            context: TemplateRequestContext):

        for station_data in template_data.stations:
            if station_data.current is not None:
                station_id = station_data.current.station_id
                station_data.get_average = TemplateMethod(
                    AverageRequest,
                    station_id=station_id,
                    start_date=last_sent_time,
                ).bind(context, mode)
                station_data.get_average_all = TemplateMethod(
                    AverageRequest,
                    station_id=station_id
                ).bind(context, mode)
                station_data.get_average_minutes = TemplateMethod(
                    AverageMinutesRequest,
                    station_id=station_id
                ).bind(context, mode)
                station_data.get_assumed_state = TemplateMethod(
                    AssumedStateRequest,
                    station_id=station_id
                ).bind(context, mode)
        if template_data.station is not None and template_data.station.current is not None:
            station_id = template_data.station.current.station_id
            template_data.station.get_average = TemplateMethod(
                AverageRequest,
                station_id=station_id,
                start_date=last_sent_time,
            ).bind(context, mode)
            template_data.station.get_average_all = TemplateMethod(
                AverageRequest,
                station_id=station_id
            ).bind(context, mode)
            template_data.station.get_average_minutes = TemplateMethod(
                AverageMinutesRequest,
                station_id=station_id
            ).bind(context, mode)
            template_data.station.get_assumed_state = TemplateMethod(
                AssumedStateRequest,
                station_id=station_id
            ).bind(context, mode)


    async def generate_message(self, message: Message, force = False, include_data = False) -> MessageItem | None:
        template_data = TemplateData(
            stations       = [],
            station        = None,
            now            = datetime.now(self._message_timezone),
            timedelta      = timedelta,
            last_sent_time = message.last_sent_time.replace(
                    tzinfo=timezone.utc
                ).astimezone(
                    self._message_timezone
                ) if message.last_sent_time else None,
        )

        stations = sorted(message.stations, key=lambda s: s.order)

        if not any(station.enabled for station in stations):
            print(f"All stations for message '{message.name}' are disabled")
            return None

        message_station = await self._populate_stations_data(template_data, stations, force)
        if len(stations) == 1 and message_station is None:
            print(f"The station for message '{message.name}' is disabled")
            return None

        context = TemplateRequestContext()
        self._add_methods(template_data, message.last_sent_time, TemplateMethodMode.Collect, context)

        timeout = await get_send_timeout(message.timeout_template, template_data.to_dict(self._message_timezone, True))
        template_data.timeout = timeout
        should_send = await get_should_send(message.should_send_template, template_data.to_dict(self._message_timezone, True))
        next_send_time = (
            (message.last_sent_time or datetime.min) + timedelta(seconds=timeout)
        ).replace(tzinfo=timezone.utc)

        _ = await generate_message(message.message_template, template_data.to_dict(self._message_timezone, True))
        await context.resolve_requests(self._injector)
        self._add_methods(template_data, message.last_sent_time, TemplateMethodMode.Resolve, context)
        message_content = await generate_message(message.message_template, template_data.to_dict(self._message_timezone, True))

        data = template_data.to_dict(self._message_timezone) if include_data else None

        return MessageItem(
            message = message_content,
            should_send = should_send,
            timeout = timeout,
            next_send_time = next_send_time,
            data = data,
        )
