from beanie import Document
from typing import Optional


class Bot(Document):
    bot_token: Optional[str] = None
    enabled: bool = True
    hook_enabled: bool = True
