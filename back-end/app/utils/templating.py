from jinja2 import Environment


def generate_message(template: str, data: dict):
    try:
        environment = Environment(
            lstrip_blocks=True,
            trim_blocks=True,
        )
        template = environment.from_string(template)
        return template.render(data)
    except Exception as e:
        raise Exception(f"Error in 'Message' template: {repr(e)}")

def get_send_timeout(template: str, data: dict) -> int:
    try:
        environment = Environment(
            lstrip_blocks=True,
            trim_blocks=True,
        )
        template = environment.from_string(template)
        return int(template.render(data))
    except Exception as e:
        raise Exception(f"Error in 'Send timeout' template: {repr(e)}")

def get_should_send(template: str, data: dict) -> bool:
    if template is None:
        return True
    try:
        environment = Environment(
            lstrip_blocks=True,
            trim_blocks=True,
        )
        template = environment.from_string(template)
        result = template.render(data)
        return result is not None and result.lower().capitalize() == "True"
    except Exception as e:
        raise Exception(f"Error in 'Should send' template: {repr(e)}")