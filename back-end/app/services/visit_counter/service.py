from datetime import date
from typing import Dict, Any
from sqlalchemy import func
from app.models import VisitCounter, DailyVisitCounter


class VisitCounterService:
    def __init__(self, db):
        self._db = db
        self._session = self._db.session

    def add_visit(self, visit_type: str, visit_date_str: str | None) -> None:
        if visit_type == "total":
            counter = self._session.query(VisitCounter).first()
            if not counter:
                counter = VisitCounter(count=0)
                self._session.add(counter)
            counter.count += 1

        elif visit_type == "daily":
            try:
                visit_date = date.fromisoformat(visit_date_str) if visit_date_str else date.today()
            except Exception:
                visit_date = date.today()
            counter = (
                self._session
                .query(DailyVisitCounter)
                .filter(func.date(DailyVisitCounter.date) == visit_date)
                .order_by(DailyVisitCounter.date)
                .first()
            )
            if not counter:
                counter = DailyVisitCounter(date=visit_date, count=0)
                self._session.add(counter)
            counter.count += 1


    def get_today_stats(self) -> Dict[str, Any]:
        total = self._session.query(VisitCounter).first()
        total_count = total.count if total else 0

        today = date.today()
        daily = (
            self._session
            .query(DailyVisitCounter)
            .filter(func.date(DailyVisitCounter.date) == today)
            .order_by(DailyVisitCounter.date)
            .first()
        )
        return {
            "totalVisitors": total_count,
            "dailyVisitors": daily.count if daily is not None else 0
        }
