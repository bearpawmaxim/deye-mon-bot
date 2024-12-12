class TelegramConfig:
    hook_base_url: str

    def __init__(self, hook_base_url):
        self.hook_base_url = hook_base_url

    def __str__(self):
        return f"TelegramConfig(hook_base_url='{self.hook_base_url}')"
