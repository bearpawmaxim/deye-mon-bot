from dataclasses import dataclass
from datetime import datetime


class BotConfig:
    timezone: str

    def __init__(self, timezone: str):
        self.timezone = timezone

    def __str__(self):
        return (f'BotConfig(timezone={self.timezone})')

@dataclass
class MessageItem:
    message: str
    timeout: int
    should_send: bool
    next_send_time: datetime
