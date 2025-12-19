from beanie import Document, Link
from typing import List, Optional

from .beanie_filter import BeanieFilter
from .lookup import LookupModel, LookupValue
from .station import Station
from .user import User


class Building(Document, LookupModel):
    name: str
    color: str

    station: Optional[Link[Station]] = None
    report_users: List[Link[User]] = []

    class Settings:
        name = "buildings"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "color": self.color,
            "station_id": str(self.station.id) if self.station else None,
            "report_user_id": str(self.report_user.id) if self.report_user else None,
        }

    @classmethod
    async def get_lookup_values(self, filter: BeanieFilter) -> List[LookupValue]:
        buildings = await self.find_all(filter).to_list()
        return [LookupValue(
            value = b.id,
            text  = b.name
        ) for b in buildings]
