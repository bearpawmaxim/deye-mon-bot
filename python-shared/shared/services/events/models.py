from dataclasses import dataclass


@dataclass
class EventItem:
    type: str
    data: dict
    user: str = None

    def to_dict(self):
        return {
            "type": self.type,
            "data": self.data,
            "user": self.user
        }