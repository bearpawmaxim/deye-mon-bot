import { Center, Group, Table, Text } from "@mantine/core";
import classes from './styles/data-table.module.css';
import { flexRender, Header } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { ColumnDataType } from "../../types";

const getSortingIcon = <T,>(
  header: Header<T, unknown>,
  sorting: 'ascending' | 'descending' | undefined,
): IconName => {
  const meta = header.column?.columnDef?.meta;
  const textSortingIcon = sorting ? (sorting === 'ascending' ? 'arrow-down-a-z' : 'arrow-up-a-z') : 'up-down';
  if (meta?.dataType) {
    const dataType = meta.dataType!;
    switch (dataType) {
      case ColumnDataType.Number:
      case ColumnDataType.DateTime:
      case ColumnDataType.Boolean:
      case ColumnDataType.Id:
        return sorting ? (sorting === 'ascending' ? 'arrow-down-1-9' : 'arrow-up-1-9') : 'up-down';
      case ColumnDataType.Text:
      default:
        return textSortingIcon;
    }
  }
  return textSortingIcon;
};

type HeaderCellProps<T> = {
  header: Header<T, unknown>;
  sorting: 'ascending' | 'descending' | undefined;
  toggleSorting: () => void;
}

export const HeaderCell = <T,>({ header, sorting, toggleSorting }: HeaderCellProps<T>) => {
  const isSortable = header.column.getCanSort();
  const icon = getSortingIcon(header, sorting);
  
  return (
    <Table.Th className={classes.th} onClick={toggleSorting} style={{ cursor: isSortable ? 'pointer' : 'default' }}>
      <Group justify="space-between" wrap="nowrap">
        <Text fz="sm">
          {header.isPlaceholder
              ? null
              : flexRender(
                  header.column.columnDef.header,
                  header.getContext()
              )}
        </Text>
        <Center className={classes.icon}>
          { isSortable && <FontAwesomeIcon icon={icon} /> }
        </Center>
      </Group>
    </Table.Th>
  );
}