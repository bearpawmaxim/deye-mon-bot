from collections import deque
import threading
import asyncio


class BoundedQueue:
    def __init__(self, maxsize=100, deduplicate=True):
        self.maxsize = maxsize
        self.data = deque(maxlen=maxsize)
        self.last_item = None
        self.deduplicate = deduplicate
        self.cv = threading.Condition()
        self.async_cv = asyncio.Condition()
        self._loop = asyncio.get_event_loop()

    def put_nowait(self, item):
        with self.cv:
            if self.deduplicate and self.last_item == item:
                return

            self.last_item = item
            self.data.append(item)
            self.cv.notify()
        asyncio.run_coroutine_threadsafe(self._notify_async(), self._loop)

    async def async_put(self, item):
        with self.cv:
            if self.deduplicate and self.last_item == item:
                return
            self.last_item = item
            self.data.append(item)
            self.cv.notify()

        async with self.async_cv:
            self.async_cv.notify()

    def get(self):
        with self.cv:
            while not self.data:
                self.cv.wait()
            return self.data.popleft()

    async def async_get(self):
        if self.data:
            return self.data.popleft()

        async with self.async_cv:
            while not self.data:
                await self.async_cv.wait()
            return self.data.popleft()

    async def _notify_async(self):
        async with self.async_cv:
            self.async_cv.notify()

    def __len__(self):
        return len(self.data)
