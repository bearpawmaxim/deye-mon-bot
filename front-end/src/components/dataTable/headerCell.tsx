import { Table } from "@mantine/core";
import classes from './styles/data-table.module.css';
import { flexRender, Header } from "@tanstack/react-table";

export type HeaderCellProps<T> = {
  header: Header<T, unknown>;
}

export const HeaderCell = <T,>({ header }: HeaderCellProps<T>) => {
  return (
    <Table.Th className={classes.th}>
      {header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
        )}
    </Table.Th>
  );
}