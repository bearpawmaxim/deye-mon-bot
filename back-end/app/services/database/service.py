import datetime
from flask_sqlalchemy import SQLAlchemy
from app.models import AllowedChat, Channel, Station, DeyeStationData, DeyeStation

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

    # def set_last_sent(self, channel_id: str, time: datetime):
    #     try:
    #         channel = self._session.query(Channel).filter_by(channel_id=channel_id).first()
    #         if not channel:
    #             print(f"No channel found with channel_id = {channel_id}")
    #             return
    #         print(f'last_sent_time: {channel.last_sent_time} => {time}')
    #         channel.last_sent_time = time
    #         self._session.commit()
    #     except Exception as e:
    #         self._session.rollback()
    #         print(f"Error updating or inserting record: {e}")

    def get_allowed_chats(self):
        try:
            return self._session.query(AllowedChat).all()
        except Exception as e:
            print(e)
            return []

    def update_station(self, station_id: str, station: DeyeStation, station_data: DeyeStationData):
        try:
            existing_record = self._session.query(Station).filter_by(station_id=station_id).first()
            
            if existing_record:
                existing_record.battery_power = station_data.battery_power
                existing_record.battery_soc = station_data.battery_soc
                existing_record.charge_power = station_data.charge_power
                existing_record.code = station_data.code
                existing_record.station_name = station.name
                existing_record.consumption_power = station_data.consumption_power
                existing_record.discharge_power = station_data.discharge_power
                existing_record.generation_power = station_data.generation_power
                existing_record.grid_power = station_data.grid_power
                existing_record.irradiate_intensity = station_data.irradiate_intensity
                existing_record.last_update_time = station_data.last_update_time
                existing_record.msg = station_data.msg
                existing_record.purchase_power = station_data.purchase_power
                existing_record.request_id = station_data.request_id
                existing_record.wire_power = station_data.wire_power
            else:
                new_record = Station(
                    station_id=station_id,
                    station_name=station.name,
                    battery_power=station_data.battery_power,
                    battery_soc=station_data.battery_soc,
                    charge_power=station_data.charge_power,
                    code=station_data.code,
                    consumption_power=station_data.consumption_power,
                    discharge_power=station_data.discharge_power,
                    generation_power=station_data.generation_power,
                    grid_power=station_data.grid_power,
                    irradiate_intensity=station_data.irradiate_intensity,
                    last_update_time=station_data.last_update_time,
                    msg=station_data.msg,
                    purchase_power=station_data.purchase_power,
                    request_id=station_data.request_id,
                    wire_power=station_data.wire_power
                )
                self._session.add(new_record)            
            self._session.commit()
        except Exception as e:
            self._session.rollback()
            print(f"Error updating or inserting record: {e}")

    def get_stations(self):
        try:
            stations = self._session.query(Station).all()
            return stations
        except Exception as e:
            print(f"Error fetching stations: {e}")
            return []
