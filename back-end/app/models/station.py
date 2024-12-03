from sqlalchemy import Column, Float, Integer, String
from .base import Base

class Station(Base):
    __tablename__ = 'station'
    id                  = Column(Integer, primary_key=True, autoincrement=True)
    station_id          = Column(String(64))
    station_name        = Column(String(128))
    battery_power       = Column(Float)
    battery_soc         = Column(Float)
    charge_power        = Column(Float)
    code                = Column(String(64))
    consumption_power   = Column(Float)
    discharge_power     = Column(Float)
    generation_power    = Column(Float)
    grid_power          = Column(Float)
    irradiate_intensity = Column(Float)
    last_update_time    = Column(String(64))
    msg                 = Column(String(64))
    purchase_power      = Column(Float)
    request_id          = Column(String(64))
    wire_power          = Column(Float)

    def __str__(self):
        return (f"Station(id={self.id}, station_id='{self.station_id}', "
                f"battery_power={self.battery_power}, battery_soc={self.battery_soc}, "
                f"charge_power={self.charge_power}, code='{self.code}', "
                f"consumption_power={self.consumption_power}, discharge_power={self.discharge_power}, "
                f"generation_power={self.generation_power}, grid_power={self.grid_power}, "
                f"irradiate_intensity={self.irradiate_intensity}, last_update_time='{self.last_update_time}', "
                f"msg='{self.msg}', purchase_power={self.purchase_power}, "
                f"request_id='{self.request_id}', wire_power={self.wire_power})")
