import { Box, Group, Progress, Text } from "@mantine/core";
import { FC, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { minutesToHoursAndMinutes } from "../../../utils";
import { TimeSlot } from "../../../stores/types";
import classes from '../../styles/buildings.module.css';
import dayjs from "dayjs";

type OutageSlotProps = {
  isDark: boolean;
  slot: TimeSlot;
};

export const OutageSlot: FC<OutageSlotProps> = ({ isDark, slot }) => {
  const now = dayjs();
  const minutesFromMidnight = useMemo(() => {
    const midnight = now.startOf('day');
    return now.diff(midnight, 'minute');
  }, [now]);
  const isActive = useMemo(() => {
    return slot.start <= minutesFromMidnight && minutesFromMidnight <= slot.end;
  }, [minutesFromMidnight, slot.end, slot.start]);
  const className = useMemo(() => {
    if (isActive) {
      return classes.activeOutageSlot;
    } else if (minutesFromMidnight > slot.start) {
      return classes.passedOutageSlot;
    }
    return classes.pendingOutageSlot;
  }, [isActive, minutesFromMidnight, slot.start]);
  const slotProgress = useMemo(() => {
    if (!isActive) {
      return 0;
    }
    const slotPassed = minutesFromMidnight - slot.start;
    const slotDuration = slot.end - slot.start;
    return (100 * slotPassed) / slotDuration;
  }, [isActive, minutesFromMidnight, slot.end, slot.start]);
  const borderLeft = `3px solid var(--mantine-color-red-${
    isDark ? "4" : "6"
  })`;

  return <Box
    className={className}
    p="sm"
    style={{
      borderRadius: "var(--mantine-radius-sm)",
      borderLeft: isActive ? 0 : borderLeft
    }}
  >
    { isActive && <Progress.Root
        className={classes.pendingOutageSlot}
        style={{
          zIndex: 1,
        }}
        pos={'absolute'}
        h='100%' w='100%'
        top='0' right='0'
        p='0' m='0'
        radius='sm'
      >
        <Progress.Section
          style={{
            borderLeft: borderLeft,
          }}
          value={slotProgress}
          className={classes.passedOutageSlot}
        />
      </Progress.Root> }
    <Group justify="space-between" style={{ zIndex: 2, position: "relative" }}>
      <Text size="sm" fw={500}>
        {minutesToHoursAndMinutes(slot.start)} - {minutesToHoursAndMinutes(slot.end)}
      </Text>
      <Text size="sm" fw={500}>
        <FontAwesomeIcon icon='clock' />
        {minutesToHoursAndMinutes(slot.end - slot.start)}
        {isActive && ` (${minutesToHoursAndMinutes(slot.end - minutesFromMidnight)} left)`}
      </Text>
    </Group>
  </Box>;
};