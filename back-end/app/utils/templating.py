from jinja2 import Environment


def _create_template(template: str):
    environment = Environment(
        lstrip_blocks = True,
        trim_blocks = True,
        enable_async = True,
    )
    return environment.from_string(template)


async def generate_message(template_str: str, data: dict):
    try:
        template = _create_template(template_str)
        return await template.render_async(data)
    except Exception as e:
        raise Exception(f"Error in 'Message' template: {repr(e)}")

async def get_send_timeout(template_str: str, data: dict) -> int:
    try:
        template = _create_template(template_str)
        return int(await template.render_async(data))
    except Exception as e:
        raise Exception(f"Error in 'Send timeout' template: {repr(e)}")

async def get_should_send(template_str: str, data: dict) -> bool:
    if template_str is None:
        return True
    try:
        template = _create_template(template_str)
        result = await template.render_async(data)
        return result is not None and result.lower().capitalize() == "True"
    except Exception as e:
        raise Exception(f"Error in 'Should send' template: {repr(e)}")
