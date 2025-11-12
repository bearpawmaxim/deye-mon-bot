import { Box, Card, Flex, Group, Text, ThemeIcon } from "@mantine/core"
import { FC, ReactNode } from "react"
import classes from './styles/statCard.module.css';

type StatsCardProps = {
  title: string;
  value?: string;
  description?: string;
  bgColor: string;
  circleColor: string;
  icon: ReactNode;
  iconColor: string;
  onClick?: () => void;
};

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  description,
  bgColor,
  circleColor,
  icon,
  iconColor,
  onClick,
}) => {
  return (
    <Card shadow="xs" padding="lg" radius="md" bg={bgColor}
      className={classes.cardHover}
      style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}
    >
      <Group justify="space-between" pos="relative">
        <Box
          className={classes.iconBox}
          style={{
            borderColor: iconColor,
          }}
        >
          <ThemeIcon color={iconColor} radius="xl" size="sm">
            {icon}
          </ThemeIcon>
        </Box>
        <Box
          className={classes.innerCircleBox}
          style={{ background: circleColor }}
        ></Box>
        <Box
          className={classes.outerCircleBox}
          style={{ background: circleColor }}
        ></Box>
      </Group>
      <Card.Section>
        <Flex w="100%" p={20} gap={10} direction="column" align="start">
          <Text fz={14} w="100%" truncate c="white" fw={600}>
            {title}
          </Text>
          <Group w="100%" gap={10}>
            <Text component="span" c="white" fz={15} fw={600}>
              {value?.toLocaleString() ?? '--'}
            </Text>
          </Group>
          {description && <Text component="span" fz={12} fw={500}>{description}</Text>}
        </Flex>
      </Card.Section>
    </Card>
  );
}
