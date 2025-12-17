
from collections.abc import Set
from typing import Any, Dict

from injector import Injector

from .models import TemplateRequest


class TemplateRequestCollector:
    def __init__(self):
        self._requests: Set[TemplateRequest] = set()

    def add(self, request: TemplateRequest):
        self._requests.add(request)
        return request

    @property
    def requests(self) -> Set[TemplateRequest]:
        return self._requests


class TemplateRequestResolver:
    async def resolve_requests(
        self,
        collector: TemplateRequestCollector,
        injector: Injector,
    ) -> Dict[TemplateRequest, Any]:
        results = {}
        for request in collector.requests:
            results[request] = await request.resolve(injector)
        return results


class ResolvedValue:
    __slots__ = ("value",)

    def __init__(self, value):
        self.value = 0 if value is None else value

    # ---- conversions ----
    def __float__(self): return float(self.value)
    def __int__(self): return int(self.value)
    def __str__(self): return str(self.value)
    def __repr__(self): return repr(self.value)

    # ---- comparisons ----
    def __eq__(self, other): return self.value == other
    def __ne__(self, other): return self.value != other
    def __gt__(self, other): return self.value > other
    def __lt__(self, other): return self.value < other
    def __ge__(self, other): return self.value >= other
    def __le__(self, other): return self.value <= other

    # ---- arithmetic ----
    def __add__(self, other): return self.value + other
    def __radd__(self, other): return other + self.value

    def __sub__(self, other): return self.value - other
    def __rsub__(self, other): return other - self.value

    def __mul__(self, other): return self.value * other
    def __rmul__(self, other): return other * self.value

    def __truediv__(self, other): return self.value / other
    def __rtruediv__(self, other): return other / self.value

    def __floordiv__(self, other): return self.value // other
    def __rfloordiv__(self, other): return other // self.value

    def __mod__(self, other): return self.value % other
    def __rmod__(self, other): return other % self.value

    def __pow__(self, other): return self.value ** other
    def __rpow__(self, other): return other ** self.value


class TemplateRequestContext:
    _collector: TemplateRequestCollector
    _resolver: TemplateRequestResolver
    
    def __init__(self):
        self._collector = TemplateRequestCollector()
        self._resolver = TemplateRequestResolver()

    def add_request(self, request: TemplateRequest) -> TemplateRequest:
        self._collector.add(request)
        return request

    async def resolve_requests(self, injector: Injector):
        self._resolved = await self._resolver.resolve_requests(self._collector, injector)

    def get_resolved_value(self, request: TemplateRequest) -> ResolvedValue:
        resolved_request = self._resolved[request]
        if resolved_request is None:
            raise ValueError(f"No resolved value for request {request}!")
        return ResolvedValue(resolved_request)
