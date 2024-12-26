import { FC } from "react";
import { TableRow, TableCell, Icon, Checkbox, CheckboxProps } from "semantic-ui-react";
import { StationItem } from "../../../stores/types";

type StationItemRowProps = {
  station: StationItem;
  loading: boolean;
  onStationEnableChange: (enabled: boolean) => void;
};

export const StationItemRow: FC<StationItemRowProps> = ({ station, loading, onStationEnableChange }) => {
  const onEnableCheckboxChange = (_: unknown, data: CheckboxProps) => {
    onStationEnableChange(data.checked ?? false);
  }

  return <TableRow>
    <TableCell>
      <Icon name="pencil" color={!station.changed || loading ? 'grey' : 'orange'}></Icon>
      {station.stationName}
    </TableCell>
    <TableCell>{station.connectionStatus}</TableCell>
    <TableCell>{station.gridInterconnectionType}</TableCell>
    <TableCell>{station.lastUpdateTime?.toString() ?? 'Never'}</TableCell>
    <TableCell>
      <Checkbox checked={station.enabled} onChange={onEnableCheckboxChange} />
    </TableCell>
  </TableRow>
};