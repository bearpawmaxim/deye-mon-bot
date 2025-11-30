from datetime import datetime
from beanie import Document


class VisitCounter(Document):
    visits_count: int = 0


class DailyVisitCounter(Document):
    visits_count: int = 0
    date: datetime
