import { FC, useCallback, useEffect, useState } from "react"
import { StationItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { connect } from "react-redux";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { cancelStationsEditing, fetchStations, saveStations } from "../../stores/thunks";
import { createSelector } from "@reduxjs/toolkit";
import { updateStationBatteryCapacity, updateStationOrder, updateStationState } from "../../stores/slices";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";
import { ActionIcon, Anchor, Button, Group, Text, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openBatteryCapacityEditDialog } from "./components";
import { useNavigate } from "react-router-dom";
import { ObjectId } from "../../schemas";


type ComponentProps = {
  stations: StationItem[];
  maxOrder: number;
  changed: boolean;
  loading: boolean;
  error: string | null;
};

const selectStations = (state: RootState) => state.stations.stations;

const selectChanged = createSelector(
  [selectStations],
  (stations) => stations.some(s => s.changed),
);
const selectMaxOrder = createSelector(
  [selectStations],
  (stations) => Math.max(...stations.map(s => s.order)),
)

const mapStateToProps = (state: RootState): ComponentProps => ({
  stations: state.stations.stations,
  maxOrder: selectMaxOrder(state),
  changed: selectChanged(state),
  loading: state.stations.loading,
  error: state.stations.error,
});

const Component: FC<ComponentProps> = ({ stations, maxOrder, changed, loading, error }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [initiallyChanged, setInitiallyChanged] = useState(false);

  const getHeaderButtons = useCallback((dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', icon: "save", color: "green", onClick: () => dispatch(saveStations()), disabled: !dataChanged, },
    { text: 'Cancel', icon: "cancel", color: "black", onClick: () => dispatch(cancelStationsEditing()), disabled: !dataChanged, },
  ], [dispatch]);
  const { setHeaderButtons, updateButtonAttributes } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(changed));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons, getHeaderButtons, changed]);  

  const fetchData = useCallback(() => dispatch(fetchStations()), [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <ErrorMessage content={error} />;
  }

  const onStationEnableChange = (id: ObjectId, enabled: boolean) => {
    dispatch(updateStationState({ id, enabled }));
  };
  const onStationOrderChange = (id: ObjectId, currentOrder: number, delta: number) => {
    dispatch(updateStationOrder({ id, currentOrder, delta }));
  };
  const onSetBatteryCapacity = (id: ObjectId, batteryCapacity: number) => {
    dispatch(updateStationBatteryCapacity({ id, batteryCapacity }));
  }

  if (changed != initiallyChanged) {
    setInitiallyChanged(!initiallyChanged);
    setTimeout(() => {
      updateButtonAttributes(0, { disabled: !changed });
      updateButtonAttributes(1, { disabled: !changed });
    }, 1);
  }

  return <Page loading={loading}>
    <DataTable<StationItem>
      data={stations}
      fetchAction={fetchData}
      tableKey="stations"
      manualSorting={true}
      columns={[
        {
          id: 'stationName',
          header: 'Name',
          accessorKey: "stationName",
          cell: ({ row }) => {
            return (
              <Anchor
                component="button"
                onClick={() => navigate(`/stations/details/${row.original.id}`)}
                fw={500}
              >
                {row.original.stationName}
              </Anchor>
            );
          }
        },
        {
          id: 'connectionStatus',
          header: 'Connection status',
          accessorKey: 'connectionStatus',
        },
        {
          id: 'mode',
          header: 'Mode',
          accessorKey: 'gridInterconnectionType',
        },
        {
          id: 'lastUpdate',
          header: 'Last updated',
          accessorKey: 'lastUpdateTime',
          meta: {
            dataType: ColumnDataType.DateTime,
          },
        },
        {
          id: 'enabled',
          header: 'Enabled',
          accessorKey: 'enabled',
          meta: {
            dataType: ColumnDataType.Boolean,
            textAlign: 'center',
            checkedChange: (row, state) => onStationEnableChange(row.id, state),
          },
        },
        {
          id: 'battery capacity',
          header: 'Battery capacity',
          accessorKey: 'batteryCapacity',
          meta: {
            dataType: ColumnDataType.Number,
          },
          cell: ({ renderValue, row }) => {
            return <Group justify="space-between">
              <Text>{renderValue()} kWh</Text>
              <Tooltip
                ml='sm'
                label={
                  <Text fw={500} fz={13}>
                    Edit battery capacity
                  </Text>
                }
              >
                <ActionIcon
                  color={'orange'}
                  onClick={() => openBatteryCapacityEditDialog({
                    batteryCapacity: row.original.batteryCapacity,
                    onClose: (result, newCapacity) => {
                      if (result) {
                        onSetBatteryCapacity(row.original.id, newCapacity)
                      }
                    }
                  })}
                >
                  <FontAwesomeIcon icon='edit' />
                </ActionIcon>
              </Tooltip>
            </Group>;
          }
        },
        {
          id: 'order',
          header: 'Order',
          accessorKey: 'order',
          meta: {
            dataType: ColumnDataType.Number,
            textAlign: 'center',
          },
          cell: ({ row }) => {
            return <Group p={0} justify="center">
              <Button.Group>
                <Button 
                  disabled={row.original.order === 1}
                  onClick={onStationOrderChange.bind(this, row.original.id, row.original.order, -1)}
                >
                  <FontAwesomeIcon icon='up-long'/>
                </Button>
                <Button
                  variant="default"
                  disabled
                  style={{ cursor: 'default' }}
                >
                  {row.original.order}
                </Button>
                <Button 
                  disabled={row.original.order === maxOrder}
                  onClick={onStationOrderChange.bind(this, row.original.id, row.original.order, 1)}
                >
                  <FontAwesomeIcon icon='down-long'/>
                </Button>
              </Button.Group>
            </Group>
          },
        }
      ]}
    />
  </Page>
};

export const StationsPage = connect(mapStateToProps)(Component);