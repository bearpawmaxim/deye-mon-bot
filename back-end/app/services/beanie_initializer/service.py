from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.beanie import BEANIE_MODELS


class BeanieInitializer:
    def __init__(self, mongo_uri: str, db_name: str):
        self._mongo_uri = mongo_uri
        self._db_name = db_name
        self.client: AsyncIOMotorClient | None = None

    async def init(self):
        self.client = AsyncIOMotorClient(self._mongo_uri)
        await init_beanie(
            database=self.client[self._db_name],
            document_models=BEANIE_MODELS,
        )
