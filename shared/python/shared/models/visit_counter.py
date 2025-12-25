from datetime import datetime
from beanie import Document


class VisitCounter(Document):
    visits_count: int = 0

    class Settings:
        name = "visit_counters"


class DailyVisitCounter(Document):
    visits_count: int = 0
    date: datetime

    class Settings:
        name = "daily_visit_counters"
