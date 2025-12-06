from datetime import datetime
from typing import Optional, List
from beanie import Document, Link
from pydantic import Field
from .bot import Bot
from .station import Station


class Message(Document):
    channel_id: Optional[str] = None
    name: Optional[str] = None
    message_template: Optional[str] = None
    should_send_template: Optional[str] = None
    timeout_template: Optional[str] = None

    bot: Link[Bot]
    last_sent_time: Optional[datetime] = None
    enabled: Optional[bool] = True

    stations: List[Link[Station]] = Field(default_factory=list)

    class Settings:
        name = "messages"

    def __str__(self):
        station_ids = [str(s.id) for s in self.stations] if self.stations else []
        return (
            f"Message(id={self.id}, channel_id='{self.channel_id}', "
            f"name='{self.name}', stations={station_ids}, "
            f"last_sent_time={self.last_sent_time}, enabled={self.enabled})"
        )

    @classmethod
    def get_lookup_values(cls):
        messages = cls.find_all().to_list()
        return [{'value': m.id, 'text': m.name} for m in messages]