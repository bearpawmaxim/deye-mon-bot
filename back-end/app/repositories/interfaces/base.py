from dataclasses import dataclass
from typing import List

from app.models import FilterConfig, SortingConfig, PagingConfig

@dataclass
class DataQuery:
    filters: List[FilterConfig]
    sorting: SortingConfig
    paging: PagingConfig

    def __post_init__(self):
        self.filters = self.filters or {}
