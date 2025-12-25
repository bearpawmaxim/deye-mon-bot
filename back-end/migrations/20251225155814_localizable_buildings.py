from typing import List, Optional

from beanie import Document, Link, iterative_migration
from shared.models.building import Building as NewBuilding
from shared.models.localizable_value import LocalizableValue
from shared.models.station import Station
from shared.models.user import User

class OldBuilding(Document):
    name: str
    color: str

    station: Optional[Link[Station]] = None
    report_users: List[Link[User]] = []

    class Settings:
        name = "buildings"


class Forward:
    @iterative_migration()
    async def name_to_localizable(
        self,
        input_document: OldBuilding,
        output_document: NewBuilding,
    ):
        output_document.name = LocalizableValue(
            { "en": input_document.name }
        ) 

class Backward:
    @iterative_migration()
    async def name_to_localizable(
        self,
        input_document: OldBuilding,
        output_document: NewBuilding,
    ):
        if input_document.name:
            output_document.name = input_document.name.root.get("en", "")
        else:
            output_document.name = ""
