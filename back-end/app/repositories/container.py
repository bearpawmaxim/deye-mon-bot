from injector import Binder, Module, singleton

from .interfaces import (
    IUsersRepository,
    IVisitsCounterRepository,
)
from .implementations import (
    UsersRepository,
    VisitsCounterRepository
)


class RepositoryContainer(Module):

    def configure(self, binder: Binder):
        binder.bind(IUsersRepository, to=UsersRepository, scope=singleton)
        binder.bind(IVisitsCounterRepository, to=VisitsCounterRepository, scope=singleton)
        