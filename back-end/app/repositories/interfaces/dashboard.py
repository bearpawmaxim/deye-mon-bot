from abc import ABC, abstractmethod
from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.building import Building
from shared.models.beanie.dashboard_config import DashboardConfig


class IDashboardRepository(ABC):
    
    @abstractmethod
    async def get_buildings(self, ids: List[PydanticObjectId] = None) -> List[Building]:
        ...

    @abstractmethod
    async def get_config(self) -> DashboardConfig:
        ...

    @abstractmethod
    async def save_config(self, config: DashboardConfig):
        ...