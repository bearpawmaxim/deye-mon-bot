from typing import List

from beanie import PydanticObjectId

from ..interfaces.bots import IBotsRepository
from shared.models.bot import Bot


class BotsRepository(IBotsRepository):
    async def get_bots(self, all: bool) -> List[Bot]:
        query = {} if all else { "enabled": True }
        return await Bot.find(query).to_list()

    async def get_bot(self, bot_id: PydanticObjectId) -> Bot:
        return await Bot.get(bot_id)

    async def create_bot(self, data: dict) -> Bot:
        bot = Bot(**data)
        await bot.save()
        return bot

    async def update_bot(self, bot_id: PydanticObjectId, data: dict) -> Bot:
        bot = await Bot.get(bot_id)
        if not bot:
            return None
        for key, value in data.items():
            setattr(bot, key, value)
        await bot.save()
        return bot
    
    async def get_is_hook_enabled(self, bot_id: PydanticObjectId) -> bool:
        bot = await Bot.get(bot_id)
        return False if bot is None else bot.hook_enabled