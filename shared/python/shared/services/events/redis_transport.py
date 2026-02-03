import json
import asyncio
import logging
from redis.asyncio import Redis, ConnectionError, TimeoutError

from .events_transport import EventsTransport
from .models import EventItem


logger = logging.getLogger(__name__)


class RedisTransport(EventsTransport):

    def __init__(self, redis_uri: str, *channels: str):
        self.redis_uri = redis_uri
        self.redis = Redis.from_url(redis_uri, decode_responses=True)
        self.channels = channels
        self._subscriber_task = None
        self._stopped = False

    async def publish(self, channel: str, event: EventItem):
        payload = json.dumps(event.to_dict())

        delay = 0.5
        while True:
            try:
                await self.redis.publish(channel, payload)
                return
            except (ConnectionError, TimeoutError):
                await asyncio.sleep(delay)
                delay = min(delay * 2, 5)
                self.redis = Redis.from_url(self.redis_uri, decode_responses=True)

    async def start_subscriber(self, handler):
        if self._subscriber_task:
            return

        self._subscriber_task = asyncio.create_task(
            self._subscriber_loop(handler)
        )

    async def _subscriber_loop(self, handler):
        backoff = 1.0

        while not self._stopped:
            try:
                pubsub = self.redis.pubsub()
                await pubsub.subscribe(*self.channels)

                async for message in pubsub.listen():
                    if message is None:
                        continue
                    if message["type"] != "message":
                        continue

                    payload = json.loads(message["data"])
                    event = EventItem(
                        type=payload["type"],
                        data=payload.get("data"),
                        private=payload.get("private"),
                    )

                    await handler(message["channel"], event)

                raise ConnectionError("Redis pubsub listener ended unexpectedly")

            except (ConnectionError, TimeoutError) as e:
                logger.warning(f"[RedisTransport] Lost connection: {e}. Reconnecting in {backoff:.1f}s...")

                await asyncio.sleep(backoff)

                self.redis = Redis.from_url(self.redis_uri, decode_responses=True)

                backoff = min(backoff * 2, 10)

            except Exception as e:
                logger.error(f"[RedisTransport] Subscriber error: {e}. Recovering in 1s...")
                await asyncio.sleep(1)
                backoff = 1

    async def stop(self):
        self._stopped = True
        try:
            await self.redis.close()
        except:
            pass
        if self._subscriber_task:
            self._subscriber_task.cancel()
