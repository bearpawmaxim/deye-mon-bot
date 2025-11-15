import { FC, ReactNode } from "react"
import { BuildingListItem } from "../../../stores/types";
import { StatsCard } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/free-solid-svg-icons";

type BuildingCardProps = {
  building: BuildingListItem;
};

export const BuildingCard: FC<BuildingCardProps> = ({ building }) => {
  const getBatteryIcon = (building: BuildingListItem): ReactNode | null => {
    const batteryPercent = building.batteryPercent ?? 0;
    let icon: IconName | null = null;
    if (batteryPercent > 75) {
      icon = 'battery-5';
    } else if (batteryPercent > 50) {
      icon = 'battery-4';
    } else if (batteryPercent > 25) {
      icon = 'battery-3';
    } else if (batteryPercent > 0) {
      icon = 'battery-2';
    } else {
      icon = 'battery-0';
    }
    return <FontAwesomeIcon icon={icon} />
  }

  const getGridIcon = (building: BuildingListItem): ReactNode => 
    building.isGridAvailable
      ? <FontAwesomeIcon icon='lightbulb' />
      : <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon='lightbulb' />
        <FontAwesomeIcon icon='slash' />
      </span>;
    
  const getOperationText = (building: BuildingListItem) => {
    if (building.isCharging && building.isDischarging) {
      return '';
    } else if (building.isCharging) {
      return 'Charging, ';
    }
    return 'Discharging, '
  }

  const rows = [];
  rows.push({
    icon: getGridIcon(building),
    left: 'Grid:',
    right: building.isGridAvailable ? 'Available' : 'Unavailable',
  });
  if (building.batteryPercent !== undefined && building.batteryPercent !== null) {
    rows.push({
      icon: getBatteryIcon(building),
      left: <>Battery: </>,
      right: <>
        {getOperationText(building)}{building.batteryPercent}%
        {building.batteryDischargeTime && <>, ~{building.batteryDischargeTime} left</>}</>,
    });
    rows.push({
      icon: <FontAwesomeIcon icon='bolt' />,
      left: <>Consumption: </>,
      right: <>{building.consumptionPower ?? '--'} kW</>
    });
  }

  return (
    <StatsCard
      key={`building_${building.id}`}
      title={building.name}
      bgColor={building.color}
      icon={getGridIcon(building)}
      iconColor={building.isGridAvailable ? "green.9" : "red.9"}
      rows={rows}
    >
    </StatsCard>
  );
}