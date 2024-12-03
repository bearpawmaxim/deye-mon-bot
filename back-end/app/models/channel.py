from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Channel(Base):
    __tablename__ = 'channel'

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    channel_id           = Column(String(64))
    message_template     = Column(String(8192))
    should_send_template = Column(String(8192))
    timeout_template     = Column(String(8192))
    station_id           = Column(Integer, ForeignKey('station.id'), nullable=True)
    last_sent_time       = Column(DateTime)
    enabled              = Column(Boolean)

    station        = relationship("Station")

    def __str__(self):
        return (f"Channel(id={self.id}, channel_id='{self.channel_id}', "
                f"template='{self.template}', station_id={self.station_id}, "
                f"last_sent_time={self.last_sent_time}, enabled={self.enabled})")