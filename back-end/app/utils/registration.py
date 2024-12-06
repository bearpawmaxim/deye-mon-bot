from importlib import import_module
import os


def load_and_register_modules(base_path: str, package: str, register_method: str, *args, **kwargs):
    module_files = [
        f[:-3] for f in os.listdir(base_path) 
        if f.endswith('.py') and f != '__init__.py'
    ]

    for module_name in module_files:
        try:
            module = import_module(f'{package}.{module_name}')
            
            if hasattr(module, register_method):
                getattr(module, register_method)(*args, **kwargs)
            else:
                print(f'no attr {register_method} in {module_name}')
        except Exception as e:
            print(f"Error in {module_name}: {e}")
