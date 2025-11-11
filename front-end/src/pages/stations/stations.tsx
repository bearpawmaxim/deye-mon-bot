import { FC, useCallback, useEffect, useState } from "react"
import { StationItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { connect } from "react-redux";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { cancelStationsEditing, fetchStations, saveStationStates } from "../../stores/thunks";
import { createSelector } from "@reduxjs/toolkit";
import { updateStationOrder, updateStationState } from "../../stores/slices";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";
import { Button, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


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
  const [initiallyChanged, setInitiallyChanged] = useState(false);

  const getHeaderButtons = useCallback((dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', icon: "save", color: "green", onClick: () => dispatch(saveStationStates()), disabled: !dataChanged, },
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

  const onStationEnableChange = (id: number, enabled: boolean) => {
    dispatch(updateStationState({ id, enabled }));
  };
  const onStationOrderChange = (id: number, currentOrder: number, delta: number) => {
    dispatch(updateStationOrder({ id, currentOrder, delta }));
  };

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
          accessorKey: "stationName"
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