class BotConfig:
    timezone: str

    def __init__(self, timezone: str):
        self.timezone = timezone

    def __str__(self):
        return (f'BotConfig(timezone={self.timezone})')
