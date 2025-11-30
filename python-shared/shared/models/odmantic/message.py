from odmantic import Model, Reference, Field
from datetime import datetime
from typing import Optional, List

from .bot import Bot
from .station import Station


class Message(Model):
    channel_id: Optional[str] = None
    name: Optional[str] = None
    message_template: Optional[str] = None
    should_send_template: Optional[str] = None
    timeout_template: Optional[str] = None

    bot: Optional[Bot] = Reference()
    last_sent_time: Optional[datetime] = None
    enabled: Optional[bool] = True

    stations: List[Station] = Field(default_factory=list)

    class Config:
        collection = "message"

    def __str__(self):
        station_ids = [str(s.id) for s in self.stations] if self.stations else []
        return (
            f"Message(id={self.id}, channel_id='{self.channel_id}', "
            f"name='{self.name}', stations={station_ids}, "
            f"last_sent_time={self.last_sent_time}, enabled={self.enabled})"
        )
