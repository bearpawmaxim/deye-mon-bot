from injector import Binder, Module, noscope, singleton

from .interfaces import (
    IUsersRepository,
    IStationsRepository,
    IStationsDataRepository,
    IVisitsCounterRepository,
)
from .implementations import (
    UsersRepository,
    StationsRepository,
    StationsDataRepository,
    VisitsCounterRepository,
)


class RepositoryContainer(Module):

    def configure(self, binder: Binder):
        binder.bind(IUsersRepository, to=UsersRepository, scope=noscope)
        binder.bind(IStationsRepository, to=StationsRepository, scope=noscope)
        binder.bind(IStationsDataRepository, to=StationsDataRepository, scope=noscope)
        binder.bind(IVisitsCounterRepository, to=VisitsCounterRepository, scope=noscope)
