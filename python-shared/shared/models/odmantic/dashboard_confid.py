from odmantic import Model
from typing import Optional


class DashboardConfig(Model):
    key: str
    value: str

    class Config:
        collection = "dashboard_config"
