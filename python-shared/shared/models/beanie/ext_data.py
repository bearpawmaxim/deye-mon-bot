from beanie import Document
from beanie.odm.fields import PydanticObjectId
from datetime import datetime, timezone

from .user import User


class ExtData(Document):
    user_id: PydanticObjectId
    grid_state: bool = False
    received_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "ext_data"
        timeseries = {
            "time_field": "received_at",
            "meta_field": "user_id",
            "granularity": "minutes",
        }

    @property
    def user(self):
        return User.get_link(self.user_id)

    def __str__(self):
        return (
            f"ExtData(id={self.id}, user_id={self.user_id}, "
            f"grid_state={self.grid_state}, received_at={self.received_at})"
        )

    def to_dict(self):
        return {
            "user_id": str(self.user_id),
            "grid_state": self.grid_state,
            "received_at": self.received_at.isoformat() if self.received_at else None,
        }
