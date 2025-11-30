from odmantic import Model, Reference
from typing import Optional

from .station import Station
from .user import User


class Building(Model):
    name: Optional[str] = None
    color: Optional[str] = None

    station: Optional[Station] = Reference()
    report_user: User = Reference()

    class Config:
        collection = "building"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "color": self.color,
            "station_id": str(self.station.id) if self.station else None,
            "report_user_id": str(self.report_user.id) if self.report_user else None,
        }

    @classmethod
    async def get_lookup_values(cls, engine):
        buildings = await engine.find(cls)
        return [{"value": str(b.id), "text": b.name} for b in buildings]
