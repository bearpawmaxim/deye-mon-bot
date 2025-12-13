from typing import Optional
from beanie import Document


class DashboardConfig(Document):
    title: str
    enable_outages_schedule: bool = False
    outages_schedule_queue: Optional[str]

    class Settings:
        name = "dashboard_config"
