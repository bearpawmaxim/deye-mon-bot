import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, MantineSize, Switch, useMantineColorScheme } from "@mantine/core"
import { FC } from "react";

type ThemePickerProps = {
  isNavbarCollapsed: boolean;
  size?: MantineSize;
}

export const ThemePicker: FC<ThemePickerProps> = ({ isNavbarCollapsed, size }) => {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Flex
      direction={isNavbarCollapsed ? "column" : "row"}
      align="center"
      justify="center"
      gap="xs"
    >
      <FontAwesomeIcon
        icon="sun"
        color={
          colorScheme === "light"
            ? "var(--mantine-color-gray-8)"
            : "var(--mantine-color-gray-3)"
        }
      />
      <Switch
        checked={colorScheme === "dark"}
        onChange={() =>
          setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
        styles={{
          track: {
            cursor: "pointer",
            border: 0,
            background:
              "linear-gradient(90deg, var(--mantine-color-orange-6) 0%, var(--mantine-color-yellow-4) 100%)",
          },
        }}
        size={size ?? isNavbarCollapsed ? "xs" : "md"}
      />
      <FontAwesomeIcon
        icon="moon"
        color={
          colorScheme === "light"
            ? "var(--mantine-color-gray-8)"
            : "var(--mantine-color-gray-3)"
        }
      />
    </Flex>
  )
}
