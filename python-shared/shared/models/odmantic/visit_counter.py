from odmantic import Model
from datetime import datetime


class VisitCounterMixin:
    count: int = 0


class VisitCounter(Model, VisitCounterMixin):
    class Config:
        collection = "visit_counter"


class DailyVisitCounter(Model, VisitCounterMixin):
    date: datetime

    class Config:
        collection = "daily_visit_counter"
