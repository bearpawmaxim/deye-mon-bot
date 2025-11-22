import { Badge, Card, Divider, Group, Stack, Text } from "@mantine/core";
import { FC, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { minutesToHoursAndMinutes } from "../../../utils";
import { DayData, DayDataStatus } from "../../../stores/types";
import { OutageSlot } from "./outageSlot";
import { Placeholder } from "./outageSchedulePlaceholder";

type DayOutageScheduleProps = {
  title: string;
  isDark: boolean;
  dayData?: DayData;
  isToday?: boolean;
};

export const DayOutageSchedule: FC<DayOutageScheduleProps> = ({ isDark, dayData, title, isToday = false }) => {
  const slots = useMemo(
    () => (dayData?.slots ?? []),
    [dayData],
  );
  const summaryOutageTime = useMemo(
    () => slots?.reduce((prev, curr) => prev += (curr.end - curr.start), 0),
    [slots],
  );
  const isAvailable = useMemo(
    () => dayData?.status === DayDataStatus.ScheduleApplies,
    [dayData?.status],
  );
  const isEmergency = useMemo(
    () => dayData?.status === DayDataStatus.EmergencyShutdowns,
    [dayData?.status],
  );
  const isWaitingForSchedule = useMemo(
    () => dayData?.status === DayDataStatus.WaitingForSchedule,
    [dayData?.status],
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md" h='100%'>
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
        <Divider />
        <Stack gap="xs" justify="center" h='100%'>
          { isWaitingForSchedule && 
            <Placeholder
              text="Waiting for schedule from YASNO"
              icon='hourglass'
              color="dimmed"
            />
          }
          { isEmergency &&
            <Placeholder
              text='Emergency shutdowns in progress'
              icon='triangle-exclamation'
              color="orange"
            />
          }
          { !isAvailable && !isWaitingForSchedule && !isEmergency &&
            <Placeholder
              text="No shutdowns"
              icon='check'
              color="green"
            />
          }
          {isAvailable && slots.map((slot, idx) => (
            <OutageSlot key={`outage_${idx}`} isDark={isDark} slot={slot} isToday={isToday} />
          ))}
        </Stack>
      </Stack>
    </Card>    
  );
};