from beanie import Document, Link
from typing import Optional

from .station import Station
from .user import User


class Building(Document):
    name: str
    color: str

    station: Optional[Link[Station]] = None
    report_user: Link[User]

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "color": self.color,
            "station_id": str(self.station.id) if self.station else None,
            "report_user_id": str(self.report_user.id) if self.report_user else None,
        }

    @classmethod
    async def get_lookup_values(cls):
        buildings = await cls.find_all().to_list()
        return [{"value": str(b.id), "text": b.name} for b in buildings]
