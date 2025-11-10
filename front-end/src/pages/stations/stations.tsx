import { FC, useEffect, useState } from "react"
import { StationItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { connect } from "react-redux";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { cancelStationsEditing, fetchStations, saveStationStates } from "../../stores/thunks";
import { createSelector } from "@reduxjs/toolkit";
import { updateStationOrder, updateStationState } from "../../stores/slices";
import { StationItemRow } from "./components";


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

  const getHeaderButtons = (dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', icon: "save", color: "green", onClick: () => dispatch(saveStationStates()), disabled: !dataChanged, },
    { text: 'Cancel', icon: "cancel", color: "black", onClick: () => dispatch(cancelStationsEditing()), disabled: !dataChanged, },
  ];
  const { setHeaderButtons, updateButtonAttributes } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(changed));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons]);  

  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  if (error) {
    return <Message error>Error: {error}</Message>;
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

  return <Segment basic loading={loading}>
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Station</TableHeaderCell>
          <TableHeaderCell>Connection status</TableHeaderCell>
          <TableHeaderCell>Mode</TableHeaderCell>
          <TableHeaderCell>Last update</TableHeaderCell>
          <TableHeaderCell width={1} textAlign="center">Enabled</TableHeaderCell>
          <TableHeaderCell width={1} textAlign="center">Order</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          (stations ?? []).map((station, index) =>
            <StationItemRow key={`station_${index}`}
              loading={loading} station={station}
              maxOrder={maxOrder}
              onStationEnableChange={onStationEnableChange.bind(this, station.id)} 
              onStationOrderChange={onStationOrderChange.bind(this, station.id, station.order)} />)
        }
      </TableBody>
    </Table>
  </Segment>
};

export const StationsPage = connect(mapStateToProps)(Component);