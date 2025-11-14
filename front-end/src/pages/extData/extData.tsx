import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { ExtDataItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchExtData } from "../../stores/thunks";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";
import { Button, Group, Paper, Select, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedGridState, setSelectedGridState] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const fetchData = useCallback(
    () => dispatch(fetchExtData()),
    [dispatch],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique users for filter dropdown
  const userOptions = useMemo(() => {
    const users = Array.from(new Set(extData.map(item => item.user).filter(Boolean)));
    return users.map(user => ({ value: user!, label: user! }));
  }, [extData]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let filtered = extData;
    
    if (selectedUser) {
      filtered = filtered.filter(item => item.user === selectedUser);
    }
    
    if (selectedGridState !== null) {
      const gridStateBoolean = selectedGridState === 'true';
      filtered = filtered.filter(item => item.grid_state === gridStateBoolean);
    }
    
    // Date range filter
    const [startDate, endDate] = dateRange;
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        if (!item.received_at) return false;
        const itemDate = new Date(item.received_at);
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return itemDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  }, [extData, selectedUser, selectedGridState, dateRange]);

  const handleDateRangeChange = (value: [Date | null, Date | null] | null) => {
    if (value) {
      setDateRange(value);
    } else {
      setDateRange([null, null]);
    }
  };

  const handleClearFilters = () => {
    setSelectedUser(null);
    setSelectedGridState(null);
    setDateRange([null, null]);
  };

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return (
    <Page loading={loading}>
      <Paper p="md" mb="md" withBorder>
        <Group align="flex-end">
          <Select
            label="User"
            placeholder="All users"
            data={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            clearable
            searchable
            style={{ minWidth: 200 }}
          />
          <Select
            label="Grid State"
            placeholder="All states"
            data={[
              { value: 'true', label: 'ON' },
              { value: 'false', label: 'OFF' }
            ]}
            value={selectedGridState}
            onChange={setSelectedGridState}
            clearable
            style={{ minWidth: 150 }}
          />
          <DatePickerInput
            type="range"
            label="Date Range"
            placeholder="Pick date range"
            value={dateRange}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={handleDateRangeChange as any}
            clearable
            style={{ minWidth: 250 }}
          />
          <Button 
            variant="light" 
            color="gray"
            onClick={handleClearFilters}
            disabled={!selectedUser && !selectedGridState && !dateRange[0] && !dateRange[1]}
          >
            Clear Filters
          </Button>
        </Group>
      </Paper>
      <DataTable<ExtDataItem>
        data={filteredData}
        fetchAction={fetchData}
        defSort={[{ id: 'received_at', desc: true }]}
        columns={[
          {
            id: 'user',
            header: 'User',
            accessorKey: 'user',
            enableSorting: true,
          },
          {
            id: 'grid_state',
            header: 'Grid State',
            accessorKey: 'grid_state',
            enableSorting: true,
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
            cell: ({ row }) => {
              const receivedAt = row.original.received_at;
              if (!receivedAt) return '-';
              
              const date = new Date(receivedAt);
              return date.toUTCString();
            },
            meta: {
              dataType: ColumnDataType.DateTime,
            },
          },
        ]}
        tableKey="extData"
      />
    </Page>
  );
};

export const ExtDataPage = connect(mapStateToProps)(Component);

