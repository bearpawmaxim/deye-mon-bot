import { ActionIcon, Button, Group, Text, Tooltip } from "@mantine/core";
import { ActionDefinition } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ActionCellProps<T> = {
  actions: Array<ActionDefinition<T>>;
  row: T;
}

export const ActionsCell = <T,>({ actions, row }: ActionCellProps<T>) => {
  return (
    <Group wrap="nowrap" gap='5' justify="center">
      {actions.map((action, idx) => {
        const element = action.icon && action.onlyIcon
          ? (
            <Tooltip
              key={idx}
              label={
                <Text fw={500} fz={13}>
                  {action.text}
                </Text>
              }
            >
              <ActionIcon color={action.color} onClick={() => action.clickHandler(row)}>
                <FontAwesomeIcon icon={action.icon} />
              </ActionIcon>
            </Tooltip>
          )
          : (
            <Button
              color={action.color}
              onClick={() => action.clickHandler(row)}
              key={idx}
              leftSection={action.icon ? <FontAwesomeIcon icon={action.icon} /> : null}
            >
              {action.text}
            </Button>
          );
        return element;
      })}
    </Group>
  );
}