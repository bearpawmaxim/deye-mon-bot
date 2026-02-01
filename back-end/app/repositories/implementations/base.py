from abc import ABC
from typing import Generic, List, TypeVar
from beanie import Document, PydanticObjectId
from pymongo import ASCENDING, DESCENDING

from app.models import SortingConfig, ColumnDataType, FilterConfig
from ..interfaces import DataQuery

T = TypeVar("T", bound=Document)


class FilterableRepository(ABC, Generic[T]):
    model: type[T]

    def build_match_stage(self, filters: List[FilterConfig]) -> dict:
        match = {}

        for filter_config in filters:
            field = getattr(self.model, filter_config.column, None)
            if not field:
                continue

            value = filter_config.value

            if hasattr(value, "to_mongo_query"):
                match.update(value.to_mongo_query(field))

            elif filter_config.data_type == ColumnDataType.Text:
                match[field] = { "$regex": value, "$options": "i" }

            elif filter_config.data_type == ColumnDataType.Number:
                match[field] = value

            elif filter_config.data_type == ColumnDataType.Boolean:
                match[field] = str(value).lower() == "true"

            elif filter_config.data_type == ColumnDataType.Id:
                match[field] = PydanticObjectId(value)

        return match


class SortableRepository(ABC, Generic[T]):
    model: type[T]

    def build_sort_stage(self, sorting: SortingConfig | None) -> dict:
        if not sorting:
            return {}

        sort_field = sorting.column
        direction = ASCENDING if sorting.order == "asc" else DESCENDING
        return { sort_field: direction }


class PageableRepository(ABC, Generic[T]):
    model: type[T]

    async def get_paged_data(
        self,
        pipeline: list,
        page: int,
        page_size: int,
    ) -> tuple[list[T], int]:
        facet_pipeline = pipeline + [
            {
                "$facet": {
                    "data": [
                        {"$skip": page * page_size},
                        {"$limit": page_size},
                    ],
                    "total": [{"$count": "count"}],
                }
            }
        ]

        print(facet_pipeline.__str__().replace('\'', '"'))

        result = await self.model.aggregate(facet_pipeline).to_list()

        if result:
            data = [self.model(**item) for item in result[0]["data"]]
            total = result[0]["total"][0]["count"] if result[0]["total"] else 0
        else:
            data, total = [], 0

        return data, total


class BaseReadRepository(
    Generic[T],
    FilterableRepository[T],
    SortableRepository[T],
    PageableRepository[T],
):
    model: type[T]

    def build_reference_joins(self, sorting: SortingConfig | None) -> list[dict]:
        return []

    async def get_data(self, query: DataQuery) -> tuple[List[T], int]:
        filters = query.filters or []
        sorting = query.sorting
        page = query.paging.page if query.paging else 0
        page_size = query.paging.page_size if query.paging else 10

        pipeline = [
            { "$addFields": { "id": "$_id" } }
        ]

        match_stage = self.build_match_stage(filters)
        if match_stage:
            pipeline.append({"$match": match_stage})

        pipeline += self.build_reference_joins(sorting)

        sort_stage = self.build_sort_stage(sorting)
        if sort_stage:
            pipeline.append({"$sort": sort_stage})

        return await self.get_paged_data(pipeline, page, page_size)
