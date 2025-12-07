from datetime import date, datetime

from ..interfaces.visits_counter import IVisitsCounterRepository
from shared.models.beanie.visit_counter import DailyVisitCounter, VisitCounter


class VisitsCounterRepository(IVisitsCounterRepository):
    async def increase_total_visits_counter(self):
        counter = await VisitCounter.find_one()
        if not counter:
            counter = VisitCounter(visits_count=0)
            await counter.insert()

        counter.visits_count += 1
        await counter.save()

    async def increase_daily_visits_counter(self, visit_date: datetime):
        counter = await DailyVisitCounter.find_one(
            DailyVisitCounter.date == visit_date
        )

        if not counter:
            counter = DailyVisitCounter(date=visit_date, visits_count=0)
            await counter.insert()

        counter.visits_count += 1
        await counter.save()

    async def get_today_stats(self) -> tuple[int,int]:
        total_visits = await VisitCounter.find_one()

        today = date.today()
        today_visits = await DailyVisitCounter.find_one(DailyVisitCounter.date == today)

        return (
            total_visits.visits_count if total_visits is not None else 0,
            today_visits.visits_count if today_visits is not None else 0
        )
