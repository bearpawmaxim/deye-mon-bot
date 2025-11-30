from beanie import Document, Link
from datetime import datetime, timezone

from .user import User


class ExtData(Document):
    user: Link[User]
    grid_state: bool = False
    received_at: datetime = datetime.now(timezone.utc)

    def __str__(self):
        return (
            f"ExtData(id={self.id}, user_id={self.user.id if self.user else None}, "
            f"grid_state={self.grid_state}, received_at={self.received_at})"
        )

    def to_dict(self):
        return {
            "user_id": str(self.user.id) if self.user else None,
            "grid_state": self.grid_state,
            "received_at": self.received_at.isoformat() if self.received_at else None,
        }
