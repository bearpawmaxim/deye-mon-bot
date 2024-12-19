import { FC, useEffect, useState } from "react"
import { Checkbox, CheckboxProps, Icon, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import { StationItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { connect } from "react-redux";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { cancelStationsEditing, fetchStations, saveStationStates } from "../../stores/thunks";
import { createSelector } from "@reduxjs/toolkit";
import { updateStationState } from "../../stores/slices";


type ComponentProps = {
  stations: StationItem[];
  changed: boolean;
  loading: boolean;
  error: string | null;
};

const selectStations = (state: RootState) => state.stations.stations;

const selectChanged = createSelector(
  [selectStations],
  (stations) => stations.some(s => s.changed)
);

const mapStateToProps = (state: RootState): ComponentProps => ({
  stations: state.stations.stations,
  changed: selectChanged(state),
  loading: state.stations.loading,
  error: state.stations.error,
});

const Component: FC<ComponentProps> = ({ stations, changed, loading, error }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const [initiallyChanged, setInitiallyChanged] = useState(false);

  const getHeaderButtons = (dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', color: "green", onClick: () => dispatch(saveStationStates()), disabled: !dataChanged, },
    { text: 'Cancel', color: "black", onClick: () => dispatch(cancelStationsEditing()), disabled: !dataChanged, },
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
    return <p>Error: {error}</p>;
  }

  const onStationEnableChange = (id: number, _: unknown, data: CheckboxProps) => {
    dispatch(updateStationState({ id, enabled: data.checked ?? false }));
  };  

  if (changed != initiallyChanged) {
    setInitiallyChanged(!initiallyChanged);
    setTimeout(() => {
      updateButtonAttributes(0, { disabled: !changed });
      updateButtonAttributes(1, { disabled: !changed });
    }, 1);
  }

  return <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Station</TableHeaderCell>
        <TableHeaderCell>Connection status</TableHeaderCell>
        <TableHeaderCell>Mode</TableHeaderCell>
        <TableHeaderCell>Last update</TableHeaderCell>
        <TableHeaderCell width={1}>Active</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {
        (stations ?? []).map((station, index) => {
          return <TableRow key={`station_${index}`}>
            <TableCell>
              <Icon name="pencil" color={!station.changed || loading ? 'grey' : 'orange'}></Icon>
              {station.stationName}
            </TableCell>
            <TableCell>{station.connectionStatus}</TableCell>
            <TableCell>{station.gridInterconnectionType}</TableCell>
            <TableCell>{station.lastUpdateTime?.toString() ?? 'Never'}</TableCell>
            <TableCell>
              <Checkbox checked={station.enabled} onChange={onStationEnableChange.bind(this, station.id)} />
            </TableCell>
          </TableRow>
        })
      }
    </TableBody>
  </Table>
};

export const StationsPage = connect(mapStateToProps)(Component);