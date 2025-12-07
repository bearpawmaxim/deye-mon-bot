from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

from shared.models.beanie.visit_counter import VisitCounter, DailyVisitCounter


class IVisitsCounterRepository(ABC):
    
    @abstractmethod
    async def increase_total_visits_counter(self):
        ...

    @abstractmethod
    async def increase_daily_visits_counter(self, visit_date: datetime):
        ...

    @abstractmethod
    async def get_today_stats(self) -> tuple[int,int]:
        ...