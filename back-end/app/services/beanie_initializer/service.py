from pymongo import AsyncMongoClient
from beanie import init_beanie
from shared.models import BEANIE_MODELS


class BeanieInitializer:
    def __init__(self, mongo_uri: str, db_name: str):
        self._mongo_uri = mongo_uri
        self._db_name = db_name
        self._client: AsyncMongoClient | None = None

    async def init(self):
        self._client = AsyncMongoClient(self._mongo_uri)
        await init_beanie(
            database=self._client[self._db_name],
            document_models=BEANIE_MODELS,
        )
