from typing import List, Optional

from beanie import Document, Link, iterative_migration
from shared.models.building import Building as NewBuilding
from shared.models.localizable_value import LocalizableValue
from shared.models.station import Station
from shared.models.user import User

class OldBuilding(Document):
    name: LocalizableValue
    color: str

    station: Optional[Link[Station]] = None
    report_users: List[Link[User]] = []

    class Settings:
        name = "buildings"


class Forward:
    @iterative_migration()
    async def add_enabled(
        self,
        input_document: OldBuilding,
        output_document: NewBuilding,
    ):
        output_document.enabled = True

class Backward:
    @iterative_migration()
    async def remove_enabled(
        self,
        input_document: OldBuilding,
        output_document: NewBuilding,
    ):
        pass
