from beanie import Document


class DashboardConfig(Document):
    key: str
    value: str
