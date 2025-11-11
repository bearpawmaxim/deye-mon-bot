import { ActionIcon, Badge, Text, Group, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ToolbarProps = {
  totalRecords: number;
  refresh: () => void;
};

export const Toolbar = ({ totalRecords, refresh }: ToolbarProps) => {
  return (
    <Group gap={5} justify="flex-end" pb="sm" pr="sm">
      <Tooltip
        label={
          <Text fw={500} fz={13}>
            Refresh
          </Text>
        }
      >
        <ActionIcon size="sm" color={'orange'} onClick={refresh} radius={"sm"}>
          <FontAwesomeIcon icon='refresh' size="xs" />
        </ActionIcon>
      </Tooltip>
      <Badge h={22}  color={'teal'} radius={"sm"}>
        Records: {totalRecords}
      </Badge>
    </Group>
  );
}