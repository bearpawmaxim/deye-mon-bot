import { Group, Pagination } from "@mantine/core";
import { Table } from "@tanstack/react-table";

interface PaginatorProps<T> {
  table: Table<T>;
  recordsCount: number;
}

export const Paginator = <T,>({ table, recordsCount }: PaginatorProps<T>) => {
  const state = table.getState();
  const currentPage = state.pagination.pageIndex ?? 0;
  const pageSize = state.pagination.pageSize ?? 10;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(recordsCount / pageSize)) : 1;

  return <Group pt="md" pb="md" justify="center">
    <Pagination
      total={totalPages}
      value={currentPage + 1}
      onChange={(page) => table.setPageIndex(page - 1)}
      withEdges
    />
  </Group>
};
