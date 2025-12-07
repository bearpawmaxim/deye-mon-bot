from injector import Binder, Module, singleton

from .interfaces import (
    IUsersRepository
)
from .implementations import (
    UsersRepository
)


class RepositoryContainer(Module):

    def configure(self, binder: Binder):
        binder.bind(IUsersRepository, to=UsersRepository, scope=singleton)
