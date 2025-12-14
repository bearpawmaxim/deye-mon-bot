from dataclasses import dataclass
from datetime import datetime

from injector import inject

from app.settings import Settings


@inject
class MessageGeneratorConfig:
    timezone: str

    def __init__(self, settings: Settings):
        self.timezone = settings.BOT_TIMEZONE

    def __str__(self):
        return (f'MessageGeneratorConfig(timezone={self.timezone})')


@dataclass
class MessageItem:
    message: str
    timeout: int
    should_send: bool
    next_send_time: datetime
