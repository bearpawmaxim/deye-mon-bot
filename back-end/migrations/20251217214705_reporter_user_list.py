from typing import Optional
from beanie import Document, Link, iterative_migration

from shared.models.building import Building as NewBuilding
from shared.models.station import Station
from shared.models.user import User


class OldBuilding(Document):
    name: str
    color: str

    station: Optional[Link[Station]] = None
    report_user: Link[User]

    class Settings:
        name = "buildings"


class Forward:
    @iterative_migration()
    async def reporter_user_to_list(
        self, input_document: OldBuilding, output_document: NewBuilding
    ):
        output_document.report_users = [input_document.report_user]


class Backward:
    @iterative_migration()
    async def reporter_user_from_list(
        self, input_document: NewBuilding, output_document: OldBuilding
    ):
        if input_document.report_users:
            output_document.report_user = input_document.report_users[0]
        else:
            output_document.report_user = None
