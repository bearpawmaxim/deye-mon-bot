from datetime import datetime, timedelta, timezone
from sqlalchemy import Float, Integer, Numeric, func
from app.models import Bot, Building, AllowedChat, ChatRequest, DashboardConfig, Message, Station, StationData, StationStatisticData, DeyeStationData, DeyeStation, User, ExtData
from .models import DatabaseConfig

class DatabaseService:
    def __init__(self, config: DatabaseConfig):
        self._db = config.db
        self._statistic_keep_days = config.statistic_keep_days
        self._session = self._db.session

    def get_messages(self, all: bool = False):
        try:
            query = self._session.query(Message).with_for_update()
            return query.all() if all else query.filter_by(enabled=True).all()
        except Exception as e:
            print(f"Error fetching messages: {e}")
            return []

    def get_message(self, message_id):
        try:
            return self._session.query(Message).filter_by(id=message_id).first()
        except Exception as e:
            print(f"Error fetching message id={message_id}: {e}")
            return []

    def save_message_state(self, id: int, enabled: bool):
        try:
            message = self._session.query(Message).filter_by(id=id).with_for_update().first()   
            if not message:
                return None
            else:
                message.enabled = enabled
                return message.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating station: {e}")
            return None
        pass

    def save_message(self, message: Message):
        try:
            existing_message = self._session.query(Message).filter_by(id=message.id).with_for_update().first()   
            if not existing_message:
                new_record = Message(
                    name = message.name,
                    channel_id = message.channel_id,
                    bot_id = message.bot_id,
                    station_id = message.station_id,
                    message_template = message.message_template,
                    timeout_template = message.timeout_template,
                    should_send_template = message.should_send_template,
                    enabled = message.enabled
                )
                self._session.add(new_record)
                self._session.flush()
                return new_record.id
            else:
                existing_message.channel_id = message.channel_id
                existing_message.bot_id = message.bot_id
                existing_message.station_id = message.station_id
                existing_message.message_template = message.message_template
                existing_message.timeout_template = message.timeout_template
                existing_message.should_send_template = message.should_send_template
                existing_message.name = message.name
                existing_message.enabled = message.enabled
                return existing_message.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating message: {e}")
            return None

    def get_is_hook_enabled(self, bot_id: int) -> bool:
        try:
            bot = self._session.query(Bot).filter_by(id=bot_id).first()
            return bot is not None and bot.hook_enabled
        except Exception as e:
            print(f'Error getting bot hook_enabled for bot {bot_id}: {e}')
            return False

    def get_is_chat_allowed(self, chat_id: str, bot_id: int) -> bool:
        try:
            chat = self._session.query(AllowedChat).filter_by(
                chat_id=chat_id,
                bot_id=bot_id
            ).first()
            return chat is not None
        except Exception as e:
            print(f'Error getting allowed chat for {chat_id}: {e}')
            return False

    def get_allowed_chats(self):
        try:
            return self._session.query(AllowedChat).all()
        except Exception as e:
            print(e)
            return []

    def get_chat_requests(self):
        try:
            return self._session.query(ChatRequest).all()
        except Exception as e:
            print(f'Error getting chat requests: {e}')
            return []

    def add_chat_request(self, chat_id, bot_id):
        try:
            existing_request = self._session.query(ChatRequest).filter_by(chat_id=chat_id, bot_id=bot_id).first()
            if not existing_request:
                new_record = ChatRequest(
                    chat_id = chat_id,
                    bot_id = bot_id
                )
                self._session.add(new_record)
        except Exception as e:
            print(f'Error getting chat requests: {e}')

    def approve_chat_request(self, request_id):
        try:
            chat_request = self._session.query(ChatRequest).filter_by(id=request_id).first()
            chat = AllowedChat(
                chat_id = chat_request.chat_id,
                bot_id = chat_request.bot_id
            )
            self._session.add(chat)
            self._session.delete(chat_request)
        except Exception as e:
            print(f'Error approving chat request {request_id}: {e}')

    def reject_chat_request(self, request_id):
        try:
            chat_request = self._session.query(ChatRequest).filter_by(id=request_id).first()
            self._session.delete(chat_request)
        except Exception as e:
            print(f'Error rejecting chat request {request_id}: {e}')

    def disallow_chat(self, chat_id: int):
        try:
            allowed_chat = self._session.query(AllowedChat).filter_by(id=chat_id).first()
            new_record = ChatRequest(
                chat_id = allowed_chat.chat_id,
                bot_id = allowed_chat.bot_id
            )
            self._session.add(new_record)
            self._session.delete(allowed_chat)
        except Exception as e:
            print(f'Error removing allowed chat {chat_id}: {e}')

    def get_station(self, station_id: str):
        return self._session.query(Station).filter_by(station_id=station_id).first()
    
    def add_station(self, station: DeyeStation):
        try:
            max_order = self._session.query(Station).order_by(Station.order.desc()).first().order
            existing_station = self.get_station(station.id)
            if existing_station == None:
                new_record = Station(
                    station_id = station.id,
                    station_name = station.name,
                    connection_status = station.connection_status,
                    contact_phone = station.contact_phone,
                    created_date = datetime.fromtimestamp(station.created_date, timezone.utc),
                    grid_interconnection_type = station.grid_interconnection_type,
                    installed_capacity = station.installed_capacity,
                    location_address = station.location_address,
                    location_lat = station.location_lat,
                    location_lng = station.location_lng,
                    owner_name = station.owner_name,
                    region_nation_id = station.region_nation_id,
                    region_timezone = station.region_timezone,
                    generation_power = station.generation_power,
                    last_update_time = datetime.fromtimestamp(station.last_update_time, timezone.utc),
                    start_operating_time = datetime.fromtimestamp(station.start_operating_time, timezone.utc),
                    order = max_order + 1,
                )
                self._session.add(new_record)
                self._session.flush()
            else:
                existing_station.connection_status = station.connection_status
                existing_station.grid_interconnection_type = station.grid_interconnection_type
                existing_station.last_update_time = datetime.fromtimestamp(station.last_update_time, timezone.utc)
        except Exception as e:
            print(f"Error inserting station: {e}")

    def add_station_data(self, station_id: str, station_data: DeyeStationData):
        try:
            station = self.get_station(station_id)
            if station is None:
                raise ValueError(f'station not found')

            last_update_time = datetime.fromtimestamp(station_data.last_update_time, timezone.utc)
            existing_record = self._session.query(StationData).filter_by(
                station_id=station.id,
                last_update_time=last_update_time
            ).first()

            if not existing_record:
                new_record = StationData(
                    station = station,
                    battery_power = station_data.battery_power,
                    battery_soc = station_data.battery_soc,
                    charge_power = station_data.charge_power,
                    code = station_data.code,
                    consumption_power = station_data.consumption_power,
                    discharge_power = station_data.discharge_power,
                    generation_power = station_data.generation_power,
                    grid_power = station_data.grid_power,
                    irradiate_intensity = station_data.irradiate_intensity,
                    last_update_time = last_update_time,
                    msg = station_data.msg,
                    purchase_power = station_data.purchase_power,
                    request_id = station_data.request_id,
                    wire_power = station_data.wire_power
                )
                self._session.add(new_record)
        except Exception as e:
            self._session.rollback()
            print(f"Error updating station data: {e}")

    def get_stations(self, all: bool = False):
        try:
            query = self._session.query(Station).order_by(Station.order.asc())
            return query.all() if all else query.filter_by(enabled=True).all()
        except Exception as e:
            print(f"Error fetching stations: {e}")
            return []

    def save_station_data(self, id: int, enabled: bool, order: int, battery_capacity: float):
        try:
            station = self._session.query(Station).filter_by(id=id).with_for_update().first()   
            if not station:
                return None
            else:
                station.enabled = enabled
                station.order = order
                station.battery_capacity = battery_capacity
                return station.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating station: {e}")
            return None

    def get_station_data_tuple(self, station_id: str):
        try:
            stations = (
                self._session.query(StationData)
                .join(Station, Station.id == StationData.station_id)
                .filter(Station.station_id == station_id)
                .order_by(StationData.last_update_time.desc())
                .limit(2)
            )
            if stations.count() == 0:
                return None
            return StationStatisticData(
                stations[1] if stations.count() == 2 else None,
                stations[0]
            )
        except Exception as e:
            print(f"Error fetching station data tuple: {e}")
            return None        

    def get_last_station_data(self, station_id: int):
        try:
            station_data = (
                self._session
                .query(StationData)
                .filter(StationData.station_id == station_id)
                .order_by(StationData.last_update_time.desc())
                .limit(1)
            )
            if station_data.count() == 0:
                return None
            return station_data.first()
        except Exception as e:
            print(f"Error fetching station data: {e}")
            return None

    def get_full_station_data(self, id: int, last_seconds: int):
        try:
            min_date = datetime.now(timezone.utc) - timedelta(seconds=last_seconds)
            stations = (
                self._session.query(StationData)
                    .join(Station, Station.id == StationData.station_id)
                    .filter(Station.id == id, StationData.last_update_time >= min_date)
                    .order_by(StationData.last_update_time.asc())
            )
            return stations
        except Exception as e:
            print(f"Error fetching station data: {e}")
            return []

    def get_station_data_average_column(
            self,
            start_date: datetime,
            end_date: datetime,
            station_id: int,
            column_name: str
            ):
        column = getattr(StationData, column_name, None)

        if column is None:
            raise ValueError(f"Column '{column_name}' does not exist in the table.")
        if not isinstance(column.type, (Integer, Float, Numeric)):
            raise TypeError(f"Column '{column_name}' is not a numeric type (Integer, Float, or Numeric).")

        query = (
            self._session.query(func.avg(column))
            .filter(StationData.station_id == station_id)
            .filter(column.isnot(None))
            .filter(column != 0)
        )

        if start_date is not None:
            query = query.filter(StationData.last_update_time >= start_date)
        if end_date is not None:
            query = query.filter(StationData.last_update_time <= end_date)

        avg_value = query.scalar()
        return avg_value if avg_value is not None else 0.0

    def delete_old_station_data(self):
        timeout = datetime.now(timezone.utc) - timedelta(days=self._statistic_keep_days)
        self._session.query(StationData).filter(StationData.last_update_time < timeout).delete(synchronize_session=False)

    def get_user(self, user_name: str):
        return self._session.query(User).filter_by(is_active=True, name=user_name).first()

    def get_user_by_id(self, user_id: int):
        return self._session.query(User).filter_by(id=user_id, is_active=True).first()

    def get_user_by_reset_token(self, token: str):
        return (
            self._session.query(User)
            .filter_by(password_reset_token=token, is_active=True)
            .with_for_update()
            .first()
        )

    def create_user(self, user_name: str, password: str):
        existing_user = self.get_user(user_name)
        if not existing_user:
            user = User(
                name = user_name,
                password = password
            )
            self._session.add(user)

    def update_user(self, user_id: int, username: str):
        existing_user = self.get_user_by_id(user_id)
        if existing_user:
            existing_user.name = username
            self._session.commit()

    def change_password(self, user_id: int, new_password: str):
        existing_user = self.get_user_by_id(user_id)
        if existing_user:
            existing_user.password = new_password
            existing_user.password_reset_token = None
            existing_user.reset_token_expiration = None
            self._session.commit()

    def get_bots(self, all: bool = False):
        query = self._session.query(Bot)
        return query.all() if all else query.filter_by(enabled=True).all()

    def save_bot(self, id: int, token: str, enabled: bool, hook_enabled: bool):
        try:
            bot = self._session.query(Bot).filter_by(id=id).with_for_update().first()   
            if not bot:
                new_record = Bot(
                    bot_token = token,
                    enabled = enabled,
                    hook_enabled = hook_enabled
                )
                self._session.add(new_record)
                return new_record.id
            else:
                bot.bot_token = token
                bot.enabled = enabled
                bot.hook_enabled = hook_enabled
                return bot.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating bot: {e}")
            return None

    def get_buildings(self):
        query = self._session.query(Building)
        return query.all()

    def get_building(self, building_id: int):
        return self._session.query(Building).filter_by(id=building_id).first()

    def save_building(self, building: Building):
        try:
            existing_building = (
                self._session
                .query(Building)
                .filter_by(id=building.id)
                .with_for_update()
                .first()
            )
            print(f"Existing building: {existing_building.to_dict() if existing_building else 'None'}")
            if not existing_building:
                new_record = Building(
                    name = building.name,
                    color = building.color,
                    station_id = building.station_id,
                    report_user_id = building.report_user_id,
                )
                self._session.add(new_record)
                self._session.flush()
                return new_record.id
            else:
                existing_building.name = building.name
                existing_building.color = building.color
                existing_building.station_id = building.station_id
                existing_building.report_user_id = building.report_user_id
                return existing_building.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating building: {e}")
            return None

    def delete_building(self, building_id: int):
        try:
            building = self._session.query(Building).filter_by(id=building_id).first()
            if building:
                self._session.delete(building)
                return True
            return False
        except Exception as e:
            self._session.rollback()
            print(f"Error deleting building: {e}")
            return False

    def get_dashboard_config(self):
        query = self._session.query(DashboardConfig)
        return query.all()

    def create_dashboard_config(self, key: str, value: str):
        """Insert or update a dashboard config key/value pair.

        Returns the id of the created/updated record or None on error.
        """
        try:
            existing = self._session.query(DashboardConfig).filter_by(key=key).with_for_update().first()
            if not existing:
                new_record = DashboardConfig(
                    key = key,
                    value = value
                )
                self._session.add(new_record)
                self._session.flush()
                return new_record.id
            else:
                existing.value = value
                return existing.id
        except Exception as e:
            self._session.rollback()
            print(f"Error creating/updating dashboard config {key}: {e}")
            return None

    def get_users(self, all: bool = False):
        query = self._session.query(User)
        return query.all() if all else query.filter_by(is_active=True).all()

    def save_user(self, id: int, name: str, password: str | None, is_active: bool, is_reporter: bool):
        try:
            user = self._session.query(User).filter_by(id=id).with_for_update().first()   
            if not user:
                hashed_password = password if password else ''
                new_record = User(
                    name = name,
                    password = hashed_password,
                    is_active = is_active,
                    is_reporter = is_reporter
                )
                self._session.add(new_record)
                self._session.flush()
                return new_record.id
            else:
                user.name = name
                user.is_active = is_active
                if not is_reporter and user.api_key:
                    user.api_key = None
                user.is_reporter = is_reporter
                if password:
                    user.password = password
                return user.id
        except Exception as e:
            self._session.rollback()
            print(f"Error updating user: {e}")
            return None

    def delete_user(self, id: int):
        try:
            user = self._session.query(User).filter_by(id=id).first()
            if user:
                self._session.delete(user)
                return True
            return False
        except Exception as e:
            self._session.rollback()
            print(f"Error deleting user: {e}")
            return False

    def generate_user_api_token(self, id: int, token: str):
        try:
            user = self._session.query(User).filter_by(id=id).with_for_update().first()
            if user:
                user.api_key = token
                return token
            return None
        except Exception as e:
            self._session.rollback()
            print(f"Error generating API token for user: {e}")
            return None

    def delete_user_api_token(self, id: int):
        try:
            user = self._session.query(User).filter_by(id=id).with_for_update().first()
            if user:
                user.api_key = None
                return True
            return False
        except Exception as e:
            self._session.rollback()
            print(f"Error deleting API token for user: {e}")
            return False

    def get_ext_data(self):
        try:
            return self._session.query(ExtData).all()
        except Exception as e:
            print(f'Error getting ext data: {e}')
            return []

    def get_latest_ext_data_by_user_id(self, user_id: int):
        try:
            return (
                self._session
                .query(ExtData)
                .filter_by(user_id=user_id)
                .order_by(ExtData.received_at.desc())
                .first()
            )
        except Exception as e:
            print(f'Error getting latest ext data by user id: {e}')
            return []

    def update_ext_data_grid_state(self, user: str, grid_state: bool):
        try:
            user_obj = self.get_user(user)
            if not user_obj:
                print(f"User not found: {user}")
                return None
            
            new_data = ExtData(
                user_id = user_obj.id,
                grid_state = grid_state,
                received_at = datetime.now(timezone.utc)
            )
            self._session.add(new_data)
            self._session.flush()
            return new_data.id
        except Exception as e:
            self._session.rollback()
            print(f"Error saving ext data: {e}")
            return None

    def get_ext_data_statistics(self, user_id: int, start_date: datetime, end_date: datetime):
        """Get power statistics for a user between two dates"""
        try:
            records = (
                self._session
                .query(ExtData)
                .filter(
                    ExtData.user_id == user_id,
                    ExtData.received_at >= start_date,
                    ExtData.received_at <= end_date
                )
                .order_by(ExtData.received_at.asc())
                .all()
            )
            return records
        except Exception as e:
            print(f'Error getting ext data statistics: {e}')
            return []

    def delete_old_ext_data(self):
        timeout = datetime.now(timezone.utc) - timedelta(days=self._statistic_keep_days)
        self._session.query(ExtData).filter(ExtData.received_at < timeout).delete(synchronize_session=False)

    def save_changes(self):
        self._session.commit()