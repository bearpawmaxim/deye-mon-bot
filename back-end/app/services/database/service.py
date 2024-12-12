from datetime import datetime, timedelta, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Float, Integer, Numeric, func
from app.models import Bot, AllowedChat, Channel, Station, StationData, DeyeStationData, DeyeStation, User

class DatabaseService:
    def __init__(self, db: SQLAlchemy):
        self._db = db
        self._session = db.session

    def get_last_sent(self, channel_id: str):
        try:
            channel = self._session.query(Channel).filter_by(channel_id=channel_id).first()
            last_sent_time = channel.last_sent_time
            return last_sent_time
        except Exception as e:
            print(f"Error updating or inserting record: {e}")

    def get_channels(self):
        try:
            channels = self._session.query(Channel).filter_by(enabled=True).with_for_update().all()
            return channels
        except Exception as e:
            print(f"Error fetching channels: {e}")
            return []

    def get_is_chat_allowed(self, chat_id: str) -> bool:
        try:
            first_chat = self._session.query(AllowedChat).filter_by(chat_id=chat_id).first()
            return first_chat is not None
        except Exception as e:
            print(f'Error getting allowed chat for {chat_id}: {e}')
            return False

    def get_allowed_chats(self):
        try:
            return self._session.query(AllowedChat).all()
        except Exception as e:
            print(e)
            return []

    def _get_station(self, station_id: str):
        return self._session.query(Station).filter_by(station_id=station_id).first()

    def add_station(self, station: DeyeStation):
        try:
            existing_station = self._get_station(station.id)
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
                    start_operating_time = datetime.fromtimestamp(station.start_operating_time, timezone.utc)
                )
                self._session.add(new_record)
            elif (
                existing_station.connection_status != station.connection_status or
                existing_station.grid_interconnection_type != station.grid_interconnection_type
            ):
                existing_station.connection_status = station.connection_status
                existing_station.grid_interconnection_type = station.grid_interconnection_type

        except Exception as e:
            print(f"Error inserting station: {e}")

    def add_station_data(self, station_id: str, station_data: DeyeStationData):
        try:
            station = self._get_station(station_id)
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

    def get_stations(self):
        try:
            stations = self._session.query(Station).all()
            return stations
        except Exception as e:
            print(f"Error fetching stations: {e}")
            return []

    def get_station_data(self, station_id: str):
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
            return {
                'current': stations[0],
                'previous': stations[1] if stations.count() == 2 else None
            }
        except Exception as e:
            print(f"Error fetching stations: {e}")
            return None

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

    def delete_old_station_data(self, timeout_days: int):
        timeout = datetime.now(timezone.utc) - timedelta(days=timeout_days)
        self._session.query(StationData).filter(StationData.last_update_time < timeout).delete(synchronize_session=False)

    def get_user(self, user_name: str):
        return self._session.query(User).filter_by(is_active=True, name=user_name).first()
    
    def create_user(self, user_name: str, password: str):
        existing_user = self.get_user(user_name)
        if not existing_user:
            user = User(
                name = user_name,
                password = password
            )
            self._session.add(user)

    def get_bots(self):
        return self._session.query(Bot).filter_by(enabled=True).all()
