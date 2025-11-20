import { Box, Text } from "@mantine/core";
import { FC } from "react";
import { ValueRange } from "../../../types";

type OutageSlotProps = {
  isDark: boolean;
  slot: ValueRange<string>;
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
    <Text size="sm" fw={500} c={isDark ? "red.2" : "dark.8"}>
      {slot.from} - {slot.to}
    </Text>
  </Box>;
};