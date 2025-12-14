from injector import inject

from app.repositories import IStationsDataRepository, IExtDataRepository


@inject
class MaintenanceService:
    def __init__(
        self,
        stations_data: IStationsDataRepository,
        ext_data: IExtDataRepository,
    ):
        self._stations_data = stations_data
        self._ext_data = ext_data

    
    async def delete_old_data(self, keep_days: int):
        await self._stations_data.delete_old_data(keep_days)
        await self._ext_data.delete_old_data(keep_days)