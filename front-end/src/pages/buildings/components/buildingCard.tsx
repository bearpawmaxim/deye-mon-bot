import { FC, ReactNode, useCallback, useMemo } from "react"
import { BuildingListItem } from "../../../stores/types";
import { StatsCard } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/free-solid-svg-icons";
import { openPowerLogsDialog } from "../../../dialogs";
import { ProgressProps, useMantineTheme } from "@mantine/core";

export type BuildingCardProps = {
  building: BuildingListItem;
};

export const BuildingCard: FC<BuildingCardProps> = ({ building }) => {
  const handleIconClick = useCallback(() => {
    if (building.id) {
      openPowerLogsDialog({
        buildingId: building.id,
        buildingName: building.name,
      });
    }
  }, [building.id, building.name]);

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
    const statuses: Array<string> = [];
    if (building.isCharging) {
      statuses.push('Charging');
    }
    if (building.isDischarging) {
      statuses.push('Discharging');
    }
    const joined = statuses.join(', ');
    if (joined.length > 0) {
      return joined + ', ';
    }
    return joined;
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
  }
  if (building.consumptionPower) {
    rows.push({
      icon: <FontAwesomeIcon icon='bolt' />,
      left: <>Consumption: </>,
      right: <>{building.consumptionPower ?? '--'} kW</>
    });
  }

  const theme = useMantineTheme();

  const mixColors = (color1: string, color2: string, ratio: number) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r = (c1 >> 16) & 0xff;
    const g = (c1 >> 8) & 0xff;
    const b = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const mix = (a: number, b: number) => Math.round(a + (b - a) * ratio);

    return (
      "#" +
      ((1 << 24) + (mix(r, r2) << 16) + (mix(g, g2) << 8) + mix(b, b2))
        .toString(16)
        .slice(1)
    );
  }


  const getBatteryColor = useCallback((percentage: number) => {
    const value = Math.max(0, Math.min(percentage, 100));
    if (value <= 20) {
      return theme.colors.red[6];
    }
    if (value <= 50) {
      const ratio = (value - 20) / 30;
      return mixColors(theme.colors.red[5], theme.colors.yellow[5], ratio);
    }
    if (value <= 80) {
      const ratio = (value - 50) / 30;
      return mixColors(theme.colors.yellow[5], theme.colors.green[5], ratio);
    }
    return theme.colors.green[6];
  }, [theme]);


  const progress: ProgressProps | null = useMemo(() => {
    if (building.batteryPercent) {
      return {
        value: building.batteryPercent,
        striped: true,
        animated: building.isCharging || building.isDischarging,
        color: getBatteryColor(building.batteryPercent),
      } as ProgressProps;
    }
    return null;
  }, [building.batteryPercent, building.isCharging, building.isDischarging, getBatteryColor]);

  return (
    <StatsCard
      key={`building_${building.id}`}
      title={building.name}
      bgColor={building.color}
      icon={getGridIcon(building)}
      iconColor={building.isGridAvailable ? "green.9" : "red.9"}
      onClick={handleIconClick}
      rows={rows}
      progress={progress}
    >
    </StatsCard>
  );
}