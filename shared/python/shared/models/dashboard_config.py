from typing import Optional
from beanie import Document

from .localizable_value import LocalizableValue


class DashboardConfig(Document):
    title: LocalizableValue
    enable_outages_schedule: bool = False
    outages_schedule_queue: Optional[str]

    class Settings:
        name = "dashboard_config"
