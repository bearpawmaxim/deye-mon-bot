from dataclasses import dataclass


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
    
