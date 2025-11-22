import { IconName } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Group, MantineColor, Text } from "@mantine/core";
import { FC } from "react";
import classes from '../../styles/buildings.module.css';


type PlaceholderProps = {
  text: string;
  icon: IconName;
  color: MantineColor;
}

export const Placeholder: FC<PlaceholderProps> = ({ text, icon, color }) => {
  return <Group align="center" justify="center" className={classes.schedulePlaceholder}>
      <FontAwesomeIcon icon={icon} size="4x" color={color} />
      <Text fw={600} size="lg" w='50%' c='dimmed'>
        {text}
      </Text>
    </Group>;
};
