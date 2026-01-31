from abc import ABC
from typing import Generic, List, TypeVar
from beanie import Document, PydanticObjectId
from beanie.odm.queries.find import FindMany

from app.models import SortingConfig, ColumnDataType
from ..interfaces import DataQuery


T = TypeVar('T', bound = Document)

class FilterableRepository(ABC, Generic[T]):
    model: type[T]

    def apply_filter(self, find_query, filters: list):
        for filter_config in filters:
            field = getattr(self.model, filter_config.column, None)
            if field is None:
                continue

            value = filter_config.value

            if hasattr(value, "to_mongo_query"):
                find_query = find_query.find(value.to_mongo_query(field))

            elif filter_config.data_type == ColumnDataType.Text:
                find_query = find_query.find(
                    {field: {"$regex": value, "$options": "i"}}
                )

            elif filter_config.data_type == ColumnDataType.Number:
                find_query = find_query.find(field == value)

            elif filter_config.data_type == ColumnDataType.Id:
                find_query = find_query.find(field == PydanticObjectId(value))

            elif filter_config.data_type == ColumnDataType.Boolean:
                bool_value = str(filter_config.value).lower() in ('true')
                find_query = find_query.find(field == bool_value)

        return find_query


class SortableRepository(ABC, Generic[T]):
    model: type[T]

    def apply_sorting(
        self,
        find_query: FindMany[T],
        sorting: SortingConfig | None,
    ) -> FindMany[T]:
        if sorting:
            sort_field = getattr(self.model, sorting.column)
            sort_direction = -sort_field if sorting.order == "desc" else sort_field
            find_query = find_query.sort(sort_direction)
        return find_query


class PageableRepository(ABC, Generic[T]):
    model: type[T]

    async def get_paged_data(
        self,
        find_query: FindMany[T],
        page: int,
        page_size: int,
    ) -> tuple[List[T], int]:
        total = await find_query.count()
        if page_size and page_size > 0:
            skip = page * page_size
            data = await find_query.skip(skip).limit(page_size).to_list()
        else:
            data = await find_query.to_list()
        return data, total
    
class BaseReadRepository(
    Generic[T],
    FilterableRepository[T],
    SortableRepository[T],
    PageableRepository[T],
):
    model: type[T]

    async def get_data(self, query: DataQuery) -> tuple[List[T], int]:
        find_query = self.model.find()
        find_query = self.apply_filter(find_query, query.filters if query.filters else [])
        find_query = self.apply_sorting(find_query, query.sorting if query.sorting else None)
        page = query.paging.page if query.paging else 0
        page_size = query.paging.page_size if query.paging else 10
        return await self.get_paged_data(find_query, page, page_size)
