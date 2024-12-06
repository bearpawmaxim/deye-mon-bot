class TelegramConfig:
    bot_token: str
    hook_base_url: str

    def __init__(self, bot_token, hook_base_url):
        self.bot_token = bot_token
        self.hook_base_url = hook_base_url

    def __str__(self):
        return f"TelegramConfig(bot_token='***', hook_base_url='{self.hook_base_url}')"
