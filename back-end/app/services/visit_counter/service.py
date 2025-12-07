from datetime import date
from typing import Dict, Any
from injector import inject

from app.repositories import IVisitsCounterRepository
from app.services.base import BaseService
from shared.services.events.service import EventsService


@inject
class VisitCounterService(BaseService):
    def __init__(
        self,
        events: EventsService,
        visits_counter: IVisitsCounterRepository
    ):
        super().__init__(events)
        self._visits_counter = visits_counter

    async def add_visit(self, visit_type: str, visit_date_str: str | None) -> None:
        if visit_type == "total":
            await self._visits_counter.increase_total_visits_counter()

        elif visit_type == "daily":
            try:
                visit_date = date.fromisoformat(visit_date_str) if visit_date_str else date.today()
            except Exception:
                visit_date = date.today()
            await self._visits_counter.increase_daily_visits_counter(visit_date)

        self.broadcast_public("visits_updated")

    async def get_today_stats(self) -> Dict[str, Any]:
        total_count, daily_count = await self._visits_counter.get_today_stats()
        return {
            "totalVisitors": total_count,
            "dailyVisitors": daily_count
        }
