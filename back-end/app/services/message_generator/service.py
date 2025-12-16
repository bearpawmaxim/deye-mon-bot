from datetime import datetime, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from injector import Injector, inject

from shared.models import Message
from shared.models.station import Station
from .models import MessageGeneratorConfig, NumericTemplateRequest
from .context import TemplateRequestContext
from app.utils import generate_message, get_send_timeout, get_should_send
from app.repositories import IMessagesRepository, IStationsDataRepository
from ..interfaces import IMessageGeneratorService, MessageItem
from .requests import (
    AverageMinutesRequest,
    AverageRequest,
    EstimateDischargeTimeRequest,
)


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

    def _get_average_method_request(
        self,
        context: TemplateRequestContext,
        station_id,
        start_date = None,
    ):
        def wrapped(column):
            return context.add_request(
                AverageRequest(
                    station_id = station_id,
                    column     = column,
                    start_date = start_date,
                )
            )
        return wrapped

    def _get_average_minutes_method_request(
        self,
        context: TemplateRequestContext,
        station_id,
    ):
        def wrapped(column, minutes):
            return context.add_request(
                AverageMinutesRequest(
                    station_id = station_id,
                    column     = column,
                    minutes    = minutes,
                )
            )
        return wrapped
    
    def _get_estimate_discharge_time_method_request(
        self,
        context: TemplateRequestContext,
    ):
        def wrapped(
            batt_capacity_kwh: float,
            batt_soc: int,
            average_consumption_kwh: float,
        ):
            return context.add_request(
                EstimateDischargeTimeRequest(
                    batt_capacity_kwh = batt_capacity_kwh,
                    batt_soc = batt_soc,
                    average_consumption_kwh = average_consumption_kwh,
                )
            )
        return wrapped
    
    def _get_average_method_resolver(
        self,
        context: TemplateRequestContext,
        station_id,
        start_date = None,
    ):
        def wrapped(column):
            request = AverageRequest(
                station_id = station_id,
                column     = column,
                start_date = start_date,
            )
            v = context.get_resolved_value(request)
            return v
        return wrapped
    
    def _get_average_minutes_method_resolver(
        self,
        context: TemplateRequestContext,
        station_id,
    ):
        def wrapped(column, minutes):
            request = AverageMinutesRequest(
                station_id = station_id,
                column     = column,
                minutes = minutes,
            )
            return context.get_resolved_value(request)
        return wrapped
    
    def _get_estimate_discharge_time_method_resolver(
        self,
        context: TemplateRequestContext,
    ):
        def wrapped(
            batt_capacity_kwh: float,
            batt_soc: int,
            average_consumption_kwh: float,
        ):
            request = EstimateDischargeTimeRequest(
                batt_capacity_kwh = batt_capacity_kwh,
                batt_soc = batt_soc,
                average_consumption_kwh = average_consumption_kwh,
            )
            return context.get_resolved_value(request)
        return wrapped

    def _add_methods(
            self,
            template_data,
            last_sent_time,
            collect,
            context: TemplateRequestContext):
        average_method_factory = None
        average_minutes_method_factory = None
        estimate_discharge_time_method_factory = None
        if collect:
            average_method_factory = self._get_average_method_request
            average_minutes_method_factory = self._get_average_minutes_method_request
            estimate_discharge_time_method_factory = self._get_estimate_discharge_time_method_request
        else:
            average_method_factory = self._get_average_method_resolver
            average_minutes_method_factory = self._get_average_minutes_method_resolver
            estimate_discharge_time_method_factory = self._get_estimate_discharge_time_method_resolver

        for station_data in template_data['stations']:
            if 'current' in station_data:
                station_id = station_data['current']['station_id']
                station_data['get_average'] = average_method_factory(context, station_id, last_sent_time)
                station_data['get_average_all'] = average_method_factory(context, station_id)
                station_data['get_average_minutes'] = average_minutes_method_factory(context, station_id)
                station_data['get_discharge_time'] = estimate_discharge_time_method_factory(context)
        if 'station' in template_data and template_data['station'] is not None and 'current' in template_data['station']:
            station_id = template_data['station']['current']['station_id']
            template_data['station']['get_average'] = average_method_factory(context, station_id, last_sent_time)
            template_data['station']['get_average_all'] = average_method_factory(context, station_id)
            template_data['station']['get_average_minutes'] = average_minutes_method_factory(context, station_id)
            template_data['station']['get_discharge_time'] = estimate_discharge_time_method_factory(context)


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

        context = TemplateRequestContext()
        self._add_methods(template_data, message.last_sent_time, True, context)

        timeout = await get_send_timeout(message.timeout_template, template_data)
        template_data['timeout'] = timeout
        should_send = await get_should_send(message.should_send_template, template_data)
        next_send_time = (
            (message.last_sent_time or datetime.min) + timedelta(seconds=timeout)
        ).replace(tzinfo=timezone.utc)

        _ = await generate_message(message.message_template, template_data)
        await context.resolve_requests(self._injector)
        self._add_methods(template_data, message.last_sent_time, False, context)
        message_content = await generate_message(message.message_template, template_data)

        return MessageItem(
            message = message_content,
            should_send = should_send,
            timeout = timeout,
            next_send_time = next_send_time
        )
