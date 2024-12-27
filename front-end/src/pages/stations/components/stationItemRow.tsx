import { FC } from "react";
import { TableRow, TableCell, Icon, Checkbox, CheckboxProps, ButtonGroup, Button } from "semantic-ui-react";
import { StationItem } from "../../../stores/types";

type StationItemRowProps = {
  station: StationItem;
  loading: boolean;
  onStationEnableChange: (enabled: boolean) => void;
  onStationOrderChange: (delta: number) => void;
  maxOrder: number;
};

export const StationItemRow: FC<StationItemRowProps> = ({ station, maxOrder, loading, onStationEnableChange, onStationOrderChange }) => {
  const onEnableCheckboxChange = (_: unknown, data: CheckboxProps) => {
    onStationEnableChange(data.checked ?? false);
  }
  const onOrderChange = (delta: number) => {
    onStationOrderChange(delta);
  };

  return <TableRow>
    <TableCell>
      <Icon name="pencil" color={!station.changed || loading ? 'grey' : 'orange'}></Icon>
      {station.stationName}
    </TableCell>
    <TableCell>{station.connectionStatus}</TableCell>
    <TableCell>{station.gridInterconnectionType}</TableCell>
    <TableCell>{station.lastUpdateTime?.toString() ?? 'Never'}</TableCell>
    <TableCell textAlign="center">
      <Checkbox checked={station.enabled} onChange={onEnableCheckboxChange} />
    </TableCell>
    <TableCell textAlign="center">
      <ButtonGroup>
        <Button icon color="teal" disabled={station.order === 1} onClick={onOrderChange.bind(this, -1)}>
          <Icon name='arrow up' />
        </Button>
        <Button content={station.order} disabled />
        <Button icon color="orange" disabled={station.order === maxOrder} onClick={onOrderChange.bind(this, 1)}>
          <Icon name='arrow down' />
        </Button>
      </ButtonGroup>
    </TableCell>
  </TableRow>
};