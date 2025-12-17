from dataclasses import dataclass


class EventsServiceConfig:
    redis_uri: str
    is_debug: bool

    def __init__(self, redis_uri: str, is_debug: bool):
        self.redis_uri = redis_uri
        self.is_debug = is_debug

    def __str__(self):
        return (f'EventsServiceConfig(redis={self.redis_uri}, debug={self.is_debug})')


@dataclass
class EventItem:
    type: str
    data: dict
    private: bool
    user: str = None

    def to_dict(self):
        return {
            "type": self.type,
            "data": self.data,
            "private": self.private,
            "user": self.user
        }
