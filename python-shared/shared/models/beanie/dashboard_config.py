from beanie import Document


class DashboardConfig(Document):
    id: str
    values: dict[str, str]

    class Settings:
        name = "dashboard_configs"