import { Badge, Box, Card, Group, Stack, Text } from "@mantine/core";
import { FC, useMemo } from "react";
import { OutageSlot } from "./outageSlot";
import { ValueRange } from "../../../types";

export type ProcessedSlot = ValueRange<string>;

type DayOutageScheduleProps = {
  title: string;
  isDark: boolean;
  slots: Array<ProcessedSlot>;
};

export const DayOutageSchedule: FC<DayOutageScheduleProps> = ({ isDark, slots, title }) => {
  const hasOutages = useMemo(
    () => slots && slots.length > 0,
    [slots],
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            {title}
          </Text>
          {hasOutages && (
            <Badge color="red" variant="light">
              {slots.length}
            </Badge>
          )}
        </Group>
        <Stack gap="xs">
          { slots.length === 0 && <Box ta="center" py="md">
            <Text size="sm" c="dimmed">
              No outages or not yet published by YASNO 🤷
            </Text>
          </Box> }
          {slots.map((slot, idx) => (
            <OutageSlot key={`outage_${idx}`} isDark={isDark} slot={slot} />
          ))}
        </Stack>
      </Stack>
    </Card>    
  );
};