from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class StationData(Base):
    __tablename__ = 'station_data'
    id                  = Column(Integer, primary_key=True, autoincrement=True)
    station_id          = Column(String(64), ForeignKey('station.id'), nullable=False)
    battery_power       = Column(Float)
    battery_soc         = Column(Float)
    charge_power        = Column(Float)
    code                = Column(String(64))
    consumption_power   = Column(Float)
    discharge_power     = Column(Float)
    generation_power    = Column(Float)
    grid_power          = Column(Float)
    irradiate_intensity = Column(Float)
    last_update_time    = Column(DateTime, default=0)
    msg                 = Column(String(64))
    purchase_power      = Column(Float)
    request_id          = Column(String(64))
    wire_power          = Column(Float)

    station             = relationship("Station")

    def __str__(self):
        return (f"StationData(id={self.id}, station_id='{self.station_id}', battery_power={self.battery_power}, "
                f"battery_soc={self.battery_soc}, charge_power={self.charge_power}, code='{self.code}', "
                f"consumption_power={self.consumption_power}, discharge_power={self.discharge_power}, "
                f"generation_power={self.generation_power}, grid_power={self.grid_power}, "
                f"irradiate_intensity={self.irradiate_intensity}, last_update_time={self.last_update_time}, "
                f"msg='{self.msg}', purchase_power={self.purchase_power}, request_id='{self.request_id}', "
                f"wire_power={self.wire_power})")