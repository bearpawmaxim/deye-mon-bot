from abc import ABC, abstractmethod
from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.building import Building


class IBuildingsRepository(ABC):
    
    @abstractmethod
    async def get_buildings(self, ids: List[PydanticObjectId] = None) -> List[Building]:
        ...

    