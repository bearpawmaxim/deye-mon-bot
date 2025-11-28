class TelegramConfig:
    hook_base_url: str

    def __init__(self, hook_base_url):
        self.hook_base_url = hook_base_url

    def __str__(self):
        return f"TelegramConfig(hook_base_url='{self.hook_base_url}')"

class TelegramUserInfo:
    def __init__(
        self,
        id: int,
        is_bot: bool,
        first_name: str,
        username: str,
        can_join_groups: bool,
        can_read_all_group_messages: bool,
        supports_inline_queries: bool,
        can_connect_to_business: bool,
        has_main_web_app: bool,
    ):
        self.id = id
        self.is_bot = is_bot
        self.first_name = first_name
        self.username = username
        self.can_join_groups = can_join_groups
        self.can_read_all_group_messages = can_read_all_group_messages
        self.supports_inline_queries = supports_inline_queries
        self.can_connect_to_business = can_connect_to_business
        self.has_main_web_app = has_main_web_app

    @classmethod
    def from_json(cls, data: dict):
        return cls(
            id=data['id'],
            is_bot=data['is_bot'],
            first_name=data['first_name'],
            username=data['username'],
            can_join_groups=data['can_join_groups'],
            can_read_all_group_messages=data['can_read_all_group_messages'],
            supports_inline_queries=data['supports_inline_queries'],
            can_connect_to_business=data['can_connect_to_business'],
            has_main_web_app=data['has_main_web_app'],
        )
    
    def __str__(self):
        return (
            f"BotInfo(id={self.id}, is_bot={self.is_bot}, first_name='{self.first_name}', "
            f"username='{self.username}', can_join_groups={self.can_join_groups}, "
            f"can_read_all_group_messages={self.can_read_all_group_messages}, "
            f"supports_inline_queries={self.supports_inline_queries}, "
            f"can_connect_to_business={self.can_connect_to_business}, "
            f"has_main_web_app={self.has_main_web_app})"
        )
    
class TelegramChatInfo:
    def __init__(
        self,
        id: int,
        type: str,
        title: str,
        username: str,
    ):
        self.id = id
        self.type = type
        self.title = title
        self.username = username

    @classmethod
    def from_json(cls, data: dict):
        return cls(
            id = data['id'],
            type = data['type'],
            title = data.get('title', None),
            username=data.get('username', None),
        )