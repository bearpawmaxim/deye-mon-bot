from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.building import Building
from ..interfaces.buildings import IBuildingsRepository

class BuildingsRepository(IBuildingsRepository):
    
    async def get_buildings(self, ids: List[PydanticObjectId] = None) -> List[Building]:
        if ids is not None:
            return await Building.find(Building.id.in_(ids), fetch_links=True).to_list()
        return await Building.find(fetch_links=True).to_list()
