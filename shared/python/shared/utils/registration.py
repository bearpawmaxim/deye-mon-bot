import os
from importlib import import_module
import inspect


def load_and_register_modules(base_path: str, package: str, register_method: str, *args, **kwargs):
    module_files = [
        f[:-3] for f in os.listdir(base_path)
        if f.endswith('.py') and f != '__init__.py'
    ]

    for module_name in module_files:
        try:
            module = import_module(f'{package}.{module_name}')

            if not hasattr(module, register_method):
                print(f'no attr {register_method} in {module_name}')
                continue

            func = getattr(module, register_method)
            sig = inspect.signature(func)

            accepted_positional = []
            for i, (name, param) in enumerate(sig.parameters.items()):
                if param.kind in (param.POSITIONAL_ONLY, param.POSITIONAL_OR_KEYWORD):
                    if i < len(args):
                        accepted_positional.append(args[i])
                else:
                    break

            accepted_kwargs = {
                k: v for k, v in kwargs.items()
                if k in sig.parameters
            }

            func(*accepted_positional, **accepted_kwargs)

        except Exception as e:
            print(f"Error in {module_name}: {e}")
