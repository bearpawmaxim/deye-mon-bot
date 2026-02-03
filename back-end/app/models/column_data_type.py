from enum import IntEnum


class ColumnDataType(IntEnum):
    Text = 1
    Number = 2
    DateTime = 4
    Boolean = 8
    Id = 16
