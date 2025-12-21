import { FC, ReactNode, useCallback, useMemo } from "react"
import { BuildingListItem, BuildingSummaryItem } from "../../../stores/types";
import { StatsCard } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/free-solid-svg-icons";
import { openPowerLogsDialog } from "../../../dialogs";
import { ProgressProps, useMantineTheme } from "@mantine/core";

export type BuildingCardProps = {
  building: BuildingListItem;
  loadingSummary: boolean;
  buildingSummary?: BuildingSummaryItem;
};

export const BuildingCard: FC<BuildingCardProps> = ({ building, buildingSummary, loadingSummary }) => {
  const handleIconClick = useCallback(() => {
    if (building.id) {
      openPowerLogsDialog({
        buildingId: building.id,
        buildingName: building.name,
      });
    }
  }, [building.id, building.name]);

  const getBatteryIcon = (summary: BuildingSummaryItem): ReactNode | null => {
    const batteryPercent = summary.batteryPercent ?? 0;
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

  const getGridIcon = (summary?: BuildingSummaryItem): ReactNode => {
    if (!summary) return <FontAwesomeIcon icon='lightbulb' />;
    
    return summary.isGridAvailable
      ? <FontAwesomeIcon icon='lightbulb' />
      : <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon='lightbulb' />
        <FontAwesomeIcon icon='slash' />
      </span>;
  }

  const getHeaderGridIcon = (summary?: BuildingSummaryItem): ReactNode => {
    if (!summary) return <FontAwesomeIcon icon='lightbulb' />;
    
    if (summary.hasMixedReporterStates) {
      return <FontAwesomeIcon icon='lightbulb' style={{ color: 'white' }} />;
    }
    
    return summary.isGridAvailable
      ? <FontAwesomeIcon icon='lightbulb' />
      : <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon='lightbulb' />
        <FontAwesomeIcon icon='slash' />
      </span>;
  }
    
  const getOperationText = (summary: BuildingSummaryItem) => {
    const statuses: Array<string> = [];
    if (summary.isCharging) {
      statuses.push('Charging');
    }
    if (summary.isDischarging) {
      statuses.push('Discharging');
    }
    const joined = statuses.join(', ');
    if (joined.length > 0) {
      return joined + ', ';
    }
    return joined;
  }

  const rows = [];
  if (buildingSummary) {
    let availabilityText = '';
    switch (buildingSummary.gridAvailabilityPct) {
      case 0: availabilityText = 'Unavailable'; break;
      case 100: availabilityText = 'Available'; break;
      default: 
        availabilityText = buildingSummary.hasMixedReporterStates 
          ? `Partially available (${buildingSummary.gridAvailabilityPct}%)`
          : 'Partially available';
        break;
    }
    rows.push({
      icon: getGridIcon(buildingSummary),
      left: 'Grid:',
      right: availabilityText,
    });
  }
  if (buildingSummary?.batteryPercent !== undefined && buildingSummary?.batteryPercent !== null) {
    rows.push({
      icon: getBatteryIcon(buildingSummary),
      left: <>Battery: </>,
      right: <>
        {getOperationText(buildingSummary)}{buildingSummary.batteryPercent}%
        {buildingSummary.batteryDischargeTime && <>, ~{buildingSummary.batteryDischargeTime} left</>}</>,
    });
  }
  if (buildingSummary?.consumptionPower) {
    rows.push({
      icon: <FontAwesomeIcon icon='bolt' />,
      left: <>Consumption: </>,
      right: <>{buildingSummary.consumptionPower ?? '--'} kW</>
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
    if (buildingSummary?.batteryPercent) {
      return {
        value: buildingSummary.batteryPercent,
        striped: true,
        animated: buildingSummary.isCharging || buildingSummary.isDischarging,
        color: getBatteryColor(buildingSummary.batteryPercent),
      } as ProgressProps;
    }
    return null;
  }, [buildingSummary, getBatteryColor]);

  return (
    <StatsCard
      loading={loadingSummary}
      key={`building_${building.id}`}
      title={building.name}
      bgColor={building.color}
      icon={getHeaderGridIcon(buildingSummary)}
      iconColor={
        buildingSummary?.hasMixedReporterStates 
          ? "yellow.6" 
          : buildingSummary?.isGridAvailable 
            ? "green.9" 
            : "red.9"
      }
      onClick={handleIconClick}
      rows={rows}
      progress={progress}
    >
    </StatsCard>
  );
}