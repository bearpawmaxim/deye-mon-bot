from jinja2 import Environment


def generate_message(template: str, data: dict):
    environment = Environment()
    template = environment.from_string(template)
    return template.render(data)

def get_send_timeout(template: str, data: dict) -> int:
    environment = Environment()
    template = environment.from_string(template)
    return int(template.render(data))

def get_should_send(template: str, data: dict) -> bool:
    if template is None:
        return True
    environment = Environment()
    template = environment.from_string(template)
    result = template.render(data)
    return result is not None and result.lower().capitalize() == "True"