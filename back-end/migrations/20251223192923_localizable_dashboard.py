from typing import Optional

from beanie import Document, iterative_migration
from shared.models.dashboard_config import DashboardConfig as NewDashboardConfig
from shared.models.localizable_value import LocalizableValue


class OldDashboardConfig(Document):
    title: str
    enable_outages_schedule: bool = False
    outages_schedule_queue: Optional[str]

    class Settings:
        name = "dashboard_config"


class Forward:
    @iterative_migration()
    async def title_to_localizable(
        self,
        input_document: OldDashboardConfig,
        output_document: NewDashboardConfig,
    ):
        output_document.title = LocalizableValue(
            { "en": input_document.title }
        ) 

class Backward:
    @iterative_migration()
    async def title_to_localizable(
        self,
        input_document: NewDashboardConfig,
        output_document: OldDashboardConfig,
    ):
        if input_document.title:
            output_document.title = input_document.title.root.get("en", "")
        else:
            output_document.title = ""
