import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { ExtDataItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { createExtData, deleteExtData, fetchExtData, fetchLookupValues } from "../../stores/thunks";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType, LookupSchema } from "../../types";
import { Column } from "@tanstack/react-table";
import { Button, Group, Modal, Select, Stack, Switch, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { modals } from "@mantine/modals";
import { DateTimePicker } from "@mantine/dates";
import { PageHeaderButton, useHeaderContent } from "../../providers";

type ComponentProps = {
  extData: ExtDataItem[];
  loading: boolean;
  error: string | null;
  userLookup: Array<{ value?: number; text: string }>;
  lookupLoading: boolean;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  extData: state.extData.extData,
  loading: state.extData.loading,
  error: state.extData.error,
  userLookup: state.lookupValues.items[LookupSchema.ReporterUser] || [],
  lookupLoading: state.lookupValues.loading[LookupSchema.ReporterUser] || false,
});

const Component: FC<ComponentProps> = ({ extData, loading, error, userLookup, lookupLoading }) => {
  const dispatch = useAppDispatch();
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({
    user_id: null as number | null,
    grid_state: false,
    received_at: null as Date | string | null,
  });

  const fetchData = useCallback(
    () => dispatch(fetchExtData()),
    [dispatch],
  );

  useEffect(() => {
    fetchData();
    dispatch(fetchLookupValues(LookupSchema.ReporterUser));
  }, [fetchData, dispatch]);

  const userOptions = useMemo(() => {
    const users = Array.from(new Set(extData.map(item => item.user).filter(Boolean)));
    return users.map(user => ({ value: user!, label: user! }));
  }, [extData]);

  const userLookupOptions = useMemo(() => {
    return userLookup.map(user => ({
      value: String(user.value),
      label: user.text,
    }));
  }, [userLookup]);

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

  const handleOpenCreateModal = useCallback(() => {
    setFormData({
      user_id: null,
      grid_state: false,
      received_at: null,
    });
    setModalOpened(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpened(false);
  }, []);

  const handleCreate = useCallback(() => {
    if (!formData.user_id) return;

    const data: { user_id: number; grid_state: boolean; received_at?: string } = {
      user_id: formData.user_id,
      grid_state: formData.grid_state,
    };

    if (formData.received_at) {
      if (formData.received_at instanceof Date) {
        data.received_at = formData.received_at.toISOString();
      } else {
        const date = new Date(formData.received_at);
        if (!isNaN(date.getTime())) {
          data.received_at = date.toISOString();
        }
      }
    }

    dispatch(createExtData(data))
      .unwrap()
      .then(() => {
        handleCloseModal();
        dispatch(fetchExtData());
      })
      .catch((err) => {
        console.error('Failed to create ext data:', err);
      });
  }, [formData, dispatch, handleCloseModal]);

  const handleDelete = useCallback((item: ExtDataItem) => {
    if (!item.id) return;

    modals.openConfirmModal({
      title: 'Delete Event',
      children: `Are you sure you want to delete this event? User: ${item.user}, State: ${item.grid_state ? 'ON' : 'OFF'}`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        dispatch(deleteExtData(item.id!))
          .unwrap()
          .catch((err) => {
            console.error('Failed to delete ext data:', err);
          });
      },
    });
  }, [dispatch]);

  const getHeaderButtons = useCallback((): PageHeaderButton[] => [
    { text: 'Create Event', icon: "add", color: "teal", onClick: handleOpenCreateModal, disabled: false },
  ], [handleOpenCreateModal]);

  const { setHeaderButtons } = useHeaderContent();
  
  useEffect(() => {
    setHeaderButtons(getHeaderButtons());
    return () => setHeaderButtons([]);
  }, [setHeaderButtons, getHeaderButtons]);

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return (
    <>
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
            {
              id: 'actions',
              header: 'Actions',
              meta: {
                dataType: 'actions',
                actions: [
                  {
                    icon: 'trash',
                    color: 'red',
                    text: 'Delete',
                    onlyIcon: true,
                    clickHandler: (row) => handleDelete(row),
                  },
                ],
              },
            },
          ]}
          tableKey="extData"
        />
      </Page>

      <Modal opened={modalOpened} onClose={handleCloseModal} title="Create Event">
        <Stack>
          <Select
            label="User"
            placeholder="Select user"
            data={userLookupOptions}
            value={formData.user_id ? String(formData.user_id) : null}
            onChange={(val) => setFormData({ ...formData, user_id: val ? parseInt(val) : null })}
            searchable
            required
            disabled={lookupLoading}
          />
          <Switch
            label="Grid State (ON/OFF)"
            checked={formData.grid_state}
            onChange={(e) => setFormData({ ...formData, grid_state: e.currentTarget.checked })}
            onLabel={<FontAwesomeIcon icon="lightbulb" />}
            offLabel={<FontAwesomeIcon icon="lightbulb" />}
          />
          <DateTimePicker
            label="Received At (optional, defaults to now)"
            placeholder="Select date and time"
            value={formData.received_at}
            onChange={(val) => setFormData({ ...formData, received_at: val })}
            clearable
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.user_id}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export const ExtDataPage = connect(mapStateToProps)(Component);

