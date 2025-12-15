import asyncio
from typing import List
from beanie import PydanticObjectId
from injector import inject

from app.repositories import IBotsRepository
from app.services.telegram.service import TelegramService
from app.models.api import BotResponse, CreateBotRequest, UpdateBotRequest
from shared.models.bot import Bot
from shared.services import EventsService
from app.services.base import BaseService


@inject
class BotsService(BaseService):

    def __init__(
        self,
        telegram: TelegramService,
        bots: IBotsRepository,
        events: EventsService,
    ):
        super().__init__(events)
        self._telegram = telegram
        self._bots = bots


    async def get_enabled_bots(self) -> List[Bot]:
        return await self._bots.get_bots(False)


    async def get_bots(self) -> List[BotResponse]:
        bots = await self._bots.get_bots(True)

        async def process_bot(bot: Bot):
            bot_name = "Invalid bot token"
            try:
                bot_name = (await self._telegram.get_bot_info(bot.id)).username
            except Exception as e:
                print(f"Cannot get bot info for bot {bot.id}: {str(e)}")
            return BotResponse(
                id           = bot.id,
                name         = bot_name,
                token        = bot.token,
                enabled      = bot.enabled,
                hook_enabled = bot.hook_enabled,
            )

        tasks = [
            asyncio.create_task(process_bot(bot))
            for bot in bots
        ]

        return await asyncio.gather(*tasks)


    async def get_bot(self, bot_id: PydanticObjectId) -> Bot:
        return await self._bots.get_bot(bot_id)


    async def create_bot(self, dto: CreateBotRequest):
        print(dto.model_dump())
        bot = await self._bots.create_bot(dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        return bot


    async def update_bot(self, bot_id: PydanticObjectId, dto: UpdateBotRequest):
        bot = await self._bots.update_bot(bot_id, dto.model_dump())
        if bot.enabled:
            await self._telegram.add_bot(bot.id, bot.token, bot.hook_enabled)
        else:
            await self._telegram.remove_bot(bot.id)

        return bot
