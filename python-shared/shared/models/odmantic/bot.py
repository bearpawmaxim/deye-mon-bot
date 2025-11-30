from odmantic import Model
from typing import Optional


class Bot(Model):
    bot_token: Optional[str] = None
    enabled: bool = True
    hook_enabled: bool = True

    class Config:
        collection = "bot"
