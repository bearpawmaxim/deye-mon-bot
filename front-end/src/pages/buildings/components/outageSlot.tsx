import { Box, Group, Progress, Text } from "@mantine/core";
import { FC, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { minutesToHoursAndMinutes } from "../../../utils";
import { TimeSlot } from "../../../stores/types";
import classes from '../../styles/buildings.module.css';
import dayjs from "dayjs";
import { TFunction } from "i18next";

type OutageSlotProps = {
  t: TFunction;
  isDark: boolean;
  slot: TimeSlot;
  isToday?: boolean;
};

export const OutageSlot: FC<OutageSlotProps> = ({ t, isDark, slot, isToday = false }) => {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const minutesFromMidnight = useMemo(() => {
    const midnight = now.startOf('day');
    return now.diff(midnight, 'minute');
  }, [now]);
  const isActive = useMemo(() => {
    return isToday && slot.start <= minutesFromMidnight && minutesFromMidnight <= slot.end;
  }, [isToday, minutesFromMidnight, slot.end, slot.start]);
  const className = useMemo(() => {
    if (isActive) {
      return classes.activeOutageSlot;
    } else if (isToday && minutesFromMidnight > slot.start) {
      return classes.passedOutageSlot;
    }
    return classes.pendingOutageSlot;
  }, [isActive, isToday, minutesFromMidnight, slot.start]);
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

  const slotFormat = useMemo(() => t('outages.slotTimeFrameFormat', {
    startTime: minutesToHoursAndMinutes(slot.start),
    endTime: minutesToHoursAndMinutes(slot.end),
  }), [slot.end, slot.start, t]);
  const durationFormat = useMemo(() => t(
    isActive ? 'outages.activeSlotDurationFormat' : 'outages.slotDurationFormat',
    {
      duration: minutesToHoursAndMinutes(slot.end - slot.start),
      left: minutesToHoursAndMinutes(slot.end - minutesFromMidnight),
    }), [isActive, minutesFromMidnight, slot.end, slot.start, t]);

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
        {slotFormat}
      </Text>
      <Text size="sm" fw={500}>
        <FontAwesomeIcon icon='clock' />
        {durationFormat}
      </Text>
    </Group>
  </Box>;
};