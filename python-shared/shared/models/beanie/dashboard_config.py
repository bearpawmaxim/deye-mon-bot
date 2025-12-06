from beanie import Document


class DashboardConfig(Document):
    id: str
    values: dict[str, str]
