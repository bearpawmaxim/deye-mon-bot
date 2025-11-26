from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Message(Base):
    __tablename__ = 'message'

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    channel_id           = Column(String(64))
    name                 = Column(String(64))
    message_template     = Column(String(8192))
    should_send_template = Column(String(8192))
    timeout_template     = Column(String(8192))
    bot_id               = Column(Integer, ForeignKey('bot.id'))
    last_sent_time       = Column(DateTime)
    enabled              = Column(Boolean)

    bot                  = relationship("Bot")
    stations             = relationship("Station", secondary="message_stations", backref="messages", lazy="joined")

    def __str__(self):
        return (f"Message(id={self.id}, channel_id='{self.channel_id}', "
                f"template='{self.template}', station_id={self.station_id}, "
                f"last_sent_time={self.last_sent_time}, enabled={self.enabled})")