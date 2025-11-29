from collections import deque
import threading

class BoundedQueue:
    def __init__(self, maxsize=100, deduplicate=True):
        self.maxsize = maxsize
        self.data = deque(maxlen=maxsize)
        self.last_item = None
        self.deduplicate = deduplicate
        self.cv = threading.Condition()

    def put_nowait(self, item):
        with self.cv:
            if self.deduplicate and self.last_item == item:
                return

            self.last_item = item

            self.data.append(item)
            self.cv.notify()

    def get(self):
        with self.cv:
            while not self.data:
                self.cv.wait()
            return self.data.popleft()

    def __len__(self):
        return len(self.data)
