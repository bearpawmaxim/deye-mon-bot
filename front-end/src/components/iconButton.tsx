import { IconName } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, MantineColor, Text, Tooltip } from "@mantine/core";
import { FC } from "react";

type IconButtonProps = {
  icon: IconName;
  text: string;
  color: MantineColor;
  onClick: () => void;
};

export const IconButton: FC<IconButtonProps> = ({ icon, text, color, onClick }) => {
  return <Tooltip
    label={
      <Text fw={500} fz={13}>
        {text}
      </Text>
    }
  >
    <ActionIcon color={color} onClick={() => onClick()}>
      <FontAwesomeIcon icon={icon} />
    </ActionIcon>
  </Tooltip>
}