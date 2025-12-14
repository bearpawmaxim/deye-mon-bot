from typing import List
from typing import TypeGuard
from shared.models import Building, Message, Station, User
from shared.models.lookup import LookupModel, LookupValue

from ..interfaces import LookupDefinition, ILookupsRepository


class LookupsRepository(ILookupsRepository):

    lookup_map: dict[str, LookupDefinition] = {
        "building": LookupDefinition(
            filters = {},
            model   = Building,
        ),
        "message": LookupDefinition(
            filters = {},
            model   = Message,
        ),
        "station": LookupDefinition(
            filters = {},
            model   = Station,
        ),
        "user": LookupDefinition(
            filters = {},
            model   = User,
        ),
        "reporter_user": LookupDefinition(
            filters = { "is_reporter": True },
            model   = User
        )
    }

    def _is_lookup_model(self: type) -> TypeGuard[type[LookupModel]]:
        return issubclass(self, LookupModel)

    async def get_lookup_values(self, schema_name: str) -> List[LookupValue]:
        lookup_definition = self.lookup_map[schema_name]
        return await lookup_definition.model.get_lookup_values(lookup_definition.filters)
