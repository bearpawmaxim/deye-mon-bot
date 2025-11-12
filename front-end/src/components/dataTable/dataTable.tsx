import { Fragment, useCallback, useEffect } from "react";
import { ActionsColumnMeta, BooleanColumnMeta, Cell, ColumnDef, ColumnFiltersState, flexRender,
  getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  Header, SortingState, TableOptions, TypedColumnMeta, useReactTable
} from '@tanstack/react-table'
import { Toolbar } from "./toolbar";
import { Box, Group, Table } from "@mantine/core";
import { HeaderCell } from "./headerCell";
import { ActionsCell, BooleanCell } from "./cell";
import useLocalStorage from "../../hooks/useLocalStorage";
import { ColumnDataType } from "../../types";

export type DataTableColumnDef<T, TValue> = ColumnDef<T, TValue> & {
  meta?: TypedColumnMeta<T, TValue>;
};

export type DataTableProps<T> = {
  data: Array<T>;
  fetchAction: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: DataTableColumnDef<T, any>[];
  defSort?: SortingState;
  tableKey: string;
  refreshKey?: number;
  hideToolbar?: boolean;
  manualSorting?: boolean;
};

export const DataTable = <T,>({
    data,
    fetchAction,
    columns,
    defSort,
    tableKey,
    refreshKey,
    hideToolbar,
    manualSorting,
  }: DataTableProps<T>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFetchAction = useCallback(fetchAction, []);

  const fallbackData: T[] = [];

  const getStorageKey = (type: string): string => `${tableKey}_${type}`;
  const [sorting, setSorting] = useLocalStorage<SortingState>(getStorageKey('sorting'), defSort ?? []);
  const [columnFilters, setColumnFilters] = useLocalStorage<ColumnFiltersState>(getStorageKey('filters'), []);

  const fetch = useCallback(() => {
    stableFetchAction();
  }, [stableFetchAction]);

  useEffect(() => {
    fetch();
  }, [fetch, refreshKey]);

  const tableOptions: TableOptions<T> = {
    data: data ?? fallbackData,
    columns: columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: manualSorting ?? false,
    getFilteredRowModel: getFilteredRowModel(),
    manualFiltering: false,
  };

  const table = useReactTable<T>(tableOptions);

  const getSortingConfig = (header: Header<T, unknown>): 'ascending' | 'descending' | undefined => {
    return header.column.getIsSorted() 
      ? (header.column.getIsSorted() === "asc" ? "ascending" : "descending")
      : undefined;
  };

  const toggleSorting = (header: Header<T, unknown>): void => {
    if (header.column.columnDef.enableSorting) {
      header.column.toggleSorting(header.column.getIsSorted() === "asc");
    }
  };

  const getCellTextAlign = <T,>(cell: Cell<T, unknown>): 'center' | 'left' | 'right' => {
    return cell.column.columnDef.meta?.textAlign ?? 'left';
  };

  const renderCell = <T,>(cell: Cell<T, unknown>, row: T): React.ReactNode => {
    const columnDef = cell.column.columnDef;
    if (columnDef.meta?.dataType === 'actions') {
      const meta = columnDef.meta as ActionsColumnMeta<T, unknown>;
      return <ActionsCell<T>
        actions={meta.actions ?? []}
        row={row}
      />;
    } else if (columnDef.meta?.dataType === ColumnDataType.Boolean) {
      const meta = columnDef.meta as BooleanColumnMeta<T, unknown>;
      return <Group p={0} justify="center">
        <BooleanCell
          value={cell.getValue() as boolean}
          readonly={meta.readOnly}
          row={row}
          checkedChange={meta.checkedChange}
        />
      </Group>;
    }
    return flexRender(columnDef.cell, cell.getContext());
  };

  return <Box pt="sm">
    { !hideToolbar && <Toolbar
        totalRecords={data?.length ?? 0 }
        refresh={() => fetch()}
      /> }
    <Table.ScrollContainer minWidth={'100%'}>
      <Table striped key={`${tableKey}_table`} highlightOnHover withColumnBorders>
        <Table.Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Fragment key={headerGroup.id}>
              <Table.Tr key={`${headerGroup.id}_main`}>
                {headerGroup.headers.map(header => (
                  <HeaderCell<T>
                    sorting={getSortingConfig(header)}
                    toggleSorting={() => toggleSorting(header)}
                    header={header}
                    key={header.id}
                  />
                ))}
              </Table.Tr>
            </Fragment>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map(row => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Table.Td
                  key={cell.id}
                  ta={getCellTextAlign(cell)}
                >
                  {renderCell(cell, row.original)}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  </Box>
}
