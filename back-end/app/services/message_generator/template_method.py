from enum import Enum
import inspect
from typing import Any, Callable, Dict


class TemplateMethodMode(str, Enum):
    Collect = "Collect"
    Resolve = "Resolve"


class TemplateMethod:
    def __init__(self, RequestCls: type, **fixed_kwargs: Any):
        self.RequestCls = RequestCls
        self.fixed_kwargs = fixed_kwargs
        try:
            sig = inspect.signature(RequestCls)
        except (ValueError, TypeError):
            sig = inspect.signature(RequestCls.__init__)
        params = list(sig.parameters.keys())
        if params and params[0] == 'self':
            params = params[1:]
        self.param_names = params

    def bind(self, context, mode: TemplateMethodMode) -> Callable:
        def wrapped(*args, **kwargs):
            effective_kwargs: Dict[str, Any] = dict(self.fixed_kwargs)
            remaining = [p for p in self.param_names if p not in effective_kwargs]

            for name, value in zip(remaining, args):
                effective_kwargs[name] = value

            effective_kwargs.update(kwargs)
            request = self.RequestCls(**effective_kwargs)

            if mode == TemplateMethodMode.Collect:
                return context.add_request(request)
            elif mode == TemplateMethodMode.Resolve:
                return context.get_resolved_value(request)

        return wrapped
