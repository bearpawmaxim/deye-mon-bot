from .base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Building(Base):
    __tablename__ = 'building'

    id             = Column(Integer, primary_key=True, autoincrement=True)
    name           = Column(String)
    color          = Column(String)
    station_id     = Column(Integer, ForeignKey('station.id'), nullable=True)
    report_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    station        = relationship("Station")
    report_user    = relationship("User")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'station_id': self.station_id,
            'report_user_id': self.report_user_id
        }