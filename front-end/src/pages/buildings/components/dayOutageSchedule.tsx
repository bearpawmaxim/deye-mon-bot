import { Badge, Box, Card, Group, Stack, Text } from "@mantine/core";
import { FC, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { minutesToHoursAndMinutes } from "../../../utils";
import { DayData, DayDataStatus } from "../../../stores/types";
import { OutageSlot } from "./outageSlot";

type DayOutageScheduleProps = {
  title: string;
  isDark: boolean;
  dayData?: DayData;
};

export const DayOutageSchedule: FC<DayOutageScheduleProps> = ({ isDark, dayData, title }) => {
  const slots = useMemo(
    () => (dayData?.slots ?? []),
    [dayData],
  );
  const summaryOutageTime = useMemo(
    () => slots.reduce((prev, curr) => prev += (curr.end - curr.start), 0),
    [slots]
  );
  const isAvailable = useMemo(
    () => dayData?.status === DayDataStatus.ScheduleApplies,
    [dayData?.status]
  );
  // const isEmergency = useMemo(
  //   () => dayData?.status === DayDataStatus.EmergencyShutdowns,
  //   [dayData?.status]
  // );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            {title}
          </Text>
          {isAvailable && <Group gap={'xs'}>
            <Badge color="red" variant="light">
              {slots.length}
            </Badge>
            <Badge color="red" variant="light">
              <FontAwesomeIcon icon='clock' />
              {minutesToHoursAndMinutes(summaryOutageTime)}
            </Badge>
          </Group>}
        </Group>
        <Stack gap="xs" justify="center" h='100%'>
          { !isAvailable && <Box ta="center" py="md">
            <Text size="sm" c="dimmed">
              No outages or not yet published by YASNO 🤷
            </Text>
          </Box> }
          {isAvailable && slots.map((slot, idx) => (
            <OutageSlot key={`outage_${idx}`} isDark={isDark} slot={slot} />
          ))}
        </Stack>
      </Stack>
    </Card>    
  );
};