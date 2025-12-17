from sqlalchemy import Table, Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class MessageStations(Base):
    __tablename__ = 'message_stations'

    message_id    = Column(Integer, ForeignKey('message.id'), primary_key=True)
    station_id    = Column(Integer, ForeignKey('station.id'), primary_key=True)
