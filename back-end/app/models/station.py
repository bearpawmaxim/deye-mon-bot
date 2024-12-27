from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class Station(Base):
    __tablename__ = 'station'
    id                        = Column(Integer, primary_key=True, autoincrement=True)
    station_id                = Column(String(64))
    station_name              = Column(String(128))
    location_lat              = Column(Float)
    location_lng              = Column(Float)
    location_address          = Column(String(64))
    region_nation_id          = Column(Integer)
    region_timezone           = Column(String(64))
    grid_interconnection_type = Column(String(64))
    installed_capacity        = Column(Float)
    start_operating_time      = Column(Integer)
    created_date              = Column(DateTime)
    last_update_time          = Column(DateTime)
    connection_status         = Column(String(64))
    contact_phone             = Column(String(64))
    owner_name                = Column(String(256))
    generation_power          = Column(Float)
    order                     = Column(Integer, default=1)
    enabled                   = Column(Boolean, default=True)

    station_data              = relationship("StationData", back_populates="station", cascade="all, delete-orphan")

    def __str__(self):
        return (f"ClassName(id={self.id}, station_id='{self.station_id}', name='{self.name}', "
            f"connection_status='{self.connection_status}', contact_phone='{self.contact_phone}', "
            f"created_date={self.created_date}, grid_interconnection_type='{self.grid_interconnection_type}', "
            f"installed_capacity={self.installed_capacity}, location_address='{self.location_address}', "
            f"location_lat={self.location_lat}, location_lng={self.location_lng}, "
            f"owner_name='{self.owner_name}', region_nation_id={self.region_nation_id}, "
            f"region_timezone='{self.region_timezone}', generationPower={self.generation_power}, "
            f"lastUpdateTime={self.last_update_time}, start_operating_time={self.start_operating_time}, "
            f"order={self.order}, enabled={self.enabled})")
