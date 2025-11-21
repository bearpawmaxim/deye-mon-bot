import { Box, Group, Text } from "@mantine/core";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { minutesToHoursAndMinutes } from "../../../utils";
import { TimeSlot } from "../../../stores/types";

type OutageSlotProps = {
  isDark: boolean;
  slot: TimeSlot;
};

export const OutageSlot: FC<OutageSlotProps> = ({ isDark, slot }) => {  
  return <Box
    p="sm"
    style={{
      backgroundColor: isDark
        ? "var(--mantine-color-red-9)"
        : "var(--mantine-color-red-0)",
      borderRadius: "var(--mantine-radius-sm)",
      borderLeft: `3px solid var(--mantine-color-red-${
        isDark ? "4" : "6"
      })`,
    }}
  >
    <Group justify="space-between">
    <Text size="sm" fw={500} c={isDark ? "red.2" : "dark.8"}>
      {minutesToHoursAndMinutes(slot.start)} - {minutesToHoursAndMinutes(slot.end)}
    </Text>
    <Text size="sm" fw={500} c={isDark ? "red.2" : "dark.8"}>
      <FontAwesomeIcon icon='clock' />
      {minutesToHoursAndMinutes(slot.end - slot.start)}
    </Text>
    </Group>
  </Box>;
};