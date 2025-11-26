import json
import threading
from abc import ABC, abstractmethod
from typing import Callable

import redis
from .models import EventItem

class EventsTransport(ABC):

    @abstractmethod
    def publish(self, channel: str, event: EventItem):
        pass

    @abstractmethod
    def start_subscriber(self, handler: Callable[[str, EventItem], None]):
        """
        handler(channel: str, event: EventItem)
        """
        pass

class LocalTransport(EventsTransport):

    def __init__(self):
        self.handler = None

    def publish(self, channel: str, event: EventItem):
        if self.handler:
            self.handler(channel, event)

    def start_subscriber(self, handler):
        self.handler = handler


class RedisTransport(EventsTransport):

    def __init__(self, redis_url: str, *channels: str):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.channels = channels

    def publish(self, channel: str, event: EventItem):
        self.redis.publish(channel, json.dumps(event.to_dict()))

    def start_subscriber(self, handler):
        pubsub = self.redis.pubsub()
        pubsub.subscribe(*self.channels)

        def sub_loop():
            for message in pubsub.listen():
                if message["type"] != "message":
                    continue

                payload = json.loads(message["data"])
                event = EventItem(
                    type=payload["type"],
                    data=payload.get("data"),
                    private=payload.get("private")
                )

                handler(message["channel"], event)

        t = threading.Thread(target=sub_loop, daemon=True)
        t.start()
