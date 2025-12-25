from typing import Any, Dict, List, Union


MongoPrimitive = Union[str, int, float, bool, None]
MongoValue = Union[
    MongoPrimitive,
    List[MongoPrimitive],
    Dict[str, Any],
]

BeanieFilter = Dict[str, MongoValue]
