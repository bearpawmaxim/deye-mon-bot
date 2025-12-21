from beanie import Document
from typing import Optional


class Bot(Document):
    token: Optional[str] = None
    enabled: bool = True
    hook_enabled: bool = True

    class Settings:
        name = "bots"
