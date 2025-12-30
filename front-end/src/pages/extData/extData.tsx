import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { ExtDataItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { createExtData, deleteExtData, fetchExtData } from "../../stores/thunks";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType, LookupSchema } from "../../types";
import { usePageTranslation } from "../../utils";
import { Column } from "@tanstack/react-table";
import { Button, Group, Modal, Select, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { modals } from "@mantine/modals";
import { DateTimePicker } from "@mantine/dates";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { useLookup } from "../../hooks";
import { ObjectId } from "../../schemas";

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
  const t = usePageTranslation('extData');
  const [modalOpened, setModalOpened] = useState(false);
  const [formData, setFormData] = useState({
    user_id: null as ObjectId | null,
    grid_state: false,
    received_at: null as Date | string | null,
  });

  const fetchData = useCallback(
    () => dispatch(fetchExtData()),
    [dispatch],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, dispatch]);

  const { loading: lookupLoading, data: userLookup } = useLookup(LookupSchema.ReporterUser);

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
        placeholder={t('filters.allUsers')}
        data={userLookupOptions}
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
        placeholder={t('filters.all')}
        data={[
          { value: 'true', label: t('gridState.optionOn') },
          { value: 'false', label: t('gridState.optionOff') }
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

    const data: { user_id: ObjectId; grid_state: boolean; received_at?: string } = {
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

  const getUserName = useCallback((userId?: ObjectId): string => {
    return userLookup?.find(f => f.value === userId)?.text ?? 'unknown';
  }, [userLookup]);

  const handleDelete = useCallback((item: ExtDataItem) => {
    if (!item.id) {
      return;
    }
    modals.openConfirmModal({
      title: t('modal.deleteConfirmTitle'),
      children: t('modal.deleteConfirmMessage', { user: getUserName(item.userId), state: item.gridState ? t('gridState.on') : t('gridState.off') }),
      labels: { confirm: t('button.delete') ?? 'Delete', cancel: t('button.cancel') ?? 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        dispatch(deleteExtData(item.id!))
          .unwrap()
          .catch((err) => {
            console.error('Failed to delete ext data:', err);
          });
      },
    });
  }, [dispatch, getUserName, t]);

  const getHeaderButtons = useCallback((): PageHeaderButton[] => [
    { text: t('button.createEvent'), icon: "add", color: "teal", onClick: handleOpenCreateModal, disabled: false },
  ], [handleOpenCreateModal, t]);

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
                header: t('table.user'),
                accessorKey: 'user',
                enableSorting: true,
                enableColumnFilter: true,
                meta: {
                  dataType: ColumnDataType.Text,
                  filterOptions: {
                    customFilterCell: UserFilter,
                  },
                },
                cell: ({ row }) => {
                  return <Text>{getUserName(row.original.userId)}</Text>
                }
              },
            {
              id: 'grid_state',
              header: t('table.gridState'),
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
                const gridState = row.original.gridState;
                return (
                  <Group justify="center">
                    <Tooltip label={gridState ? t('gridState.tooltipOn') : t('gridState.tooltipOff')}>
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
              id: 'receivedAt',
              header: t('table.receivedAt'),
              accessorKey: 'receivedAt',
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
              meta: {
                dataType: 'actions',
                actions: [
                  {
                    icon: 'trash',
                    color: 'red',
                    text: t('button.delete'),
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

      <Modal opened={modalOpened} onClose={handleCloseModal} title={t('modal.createTitle')}>
        <Stack>
          <Select
            label={t('modal.userLabel')}
            placeholder={t('modal.selectUserPlaceholder')}
            data={userLookupOptions}
            value={formData.user_id ? String(formData.user_id) : null}
            onChange={(val) => setFormData({ ...formData, user_id: val })}
            searchable
            required
            disabled={lookupLoading}
          />
          <Switch
            label={t('modal.gridStateLabel')}
            checked={formData.grid_state}
            onChange={(e) => setFormData({ ...formData, grid_state: e.currentTarget.checked })}
            onLabel={<FontAwesomeIcon icon="lightbulb" />}
            offLabel={<FontAwesomeIcon icon="lightbulb" />}
          />
          <DateTimePicker
            label={t('modal.receivedAtLabel')}
            placeholder={t('modal.selectUserPlaceholder')}
            value={formData.received_at}
            onChange={(val) => setFormData({ ...formData, received_at: val })}
            clearable
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              {t('button.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.user_id}>
              {t('button.create') ?? t('button.add')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export const ExtDataPage = connect(mapStateToProps)(Component);

