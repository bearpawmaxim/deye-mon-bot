import { FC, useCallback, useEffect, useMemo } from "react"
import { ExtDataItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchExtData } from "../../stores/thunks";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";
import { Column } from "@tanstack/react-table";
import { Group, Select, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ComponentProps = {
  extData: ExtDataItem[];
  loading: boolean;
  error: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  extData: state.extData.extData,
  loading: state.extData.loading,
  error: state.extData.error,
});

const Component: FC<ComponentProps> = ({ extData, loading, error }) => {
  const dispatch = useAppDispatch();

  const fetchData = useCallback(
    () => dispatch(fetchExtData()),
    [dispatch],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userOptions = useMemo(() => {
    const users = Array.from(new Set(extData.map(item => item.user).filter(Boolean)));
    return users.map(user => ({ value: user!, label: user! }));
  }, [extData]);

  const UserFilter = (column: Column<ExtDataItem, unknown>) => {
    const value = column.getFilterValue() as string | undefined;
    
    return (
      <Select
        placeholder="All users"
        data={userOptions}
        value={value || null}
        onChange={(val) => column.setFilterValue(val || undefined)}
        clearable
        searchable
      />
    );
  };

  const GridStateFilter = (column: Column<ExtDataItem, unknown>) => {
    const value = column.getFilterValue() as string | undefined;
    
    return (
      <Select
        placeholder="All"
        data={[
          { value: 'true', label: '💡 ON' },
          { value: 'false', label: '🌑 OFF' }
        ]}
        value={value || null}
        onChange={(val) => column.setFilterValue(val || undefined)}
        clearable
      />
    );
  };

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return (
    <Page loading={loading}>
      <DataTable<ExtDataItem>
        data={extData}
        fetchAction={fetchData}
        defSort={[{ id: 'received_at', desc: true }]}
        useFilters={true}
        columns={[
          {
            id: 'user',
            header: 'User',
            accessorKey: 'user',
            enableSorting: true,
            enableColumnFilter: true,
            meta: {
              dataType: ColumnDataType.Text,
              filterOptions: {
                customFilterCell: UserFilter,
              },
            },
          },
          {
            id: 'grid_state',
            header: 'Grid State',
            accessorKey: 'grid_state',
            enableColumnFilter: true,
            enableSorting: true,
            filterFn: (row, columnId, filterValue) => {
              if (!filterValue) return true;
              const cellValue = row.getValue(columnId) as boolean;
              return String(cellValue) === filterValue;
            },
            meta: {
              dataType: ColumnDataType.Text,
              filterOptions: {
                customFilterCell: GridStateFilter,
              },
            },
            cell: ({ row }) => {
              const gridState = row.original.grid_state;
              return (
                <Group justify="center">
                  <Tooltip label={gridState ? 'ON' : 'OFF'}>
                    <FontAwesomeIcon 
                      icon="lightbulb"
                      size="lg"
                      style={{
                        color: gridState ? '#ffd700' : '#909296',
                        opacity: gridState ? 1 : 0.3,
                      }}
                    />
                  </Tooltip>
                </Group>
              );
            },
          },
          {
            id: 'received_at',
            header: 'Received At',
            accessorKey: 'received_at',
            enableSorting: true,
            enableColumnFilter: true,
            meta: {
              dataType: ColumnDataType.DateTime,
              filterOptions: {
              }
            },
          },
        ]}
        tableKey="extData"
      />
    </Page>
  );
};

export const ExtDataPage = connect(mapStateToProps)(Component);

