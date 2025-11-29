import { Box, Card, Flex, Group, MantineColor, Text, ThemeIcon, useMantineTheme, useMantineColorScheme, getContrastColor, Title, alpha, lighten, parseThemeColor, Progress, ProgressProps } from "@mantine/core"
import { FC, ReactNode, useMemo } from "react"
import classes from './styles/statCard.module.css';

type Row = {
  icon?: ReactNode;
  left: ReactNode;
  right?: ReactNode;
};

type StatsCardProps = {
  title: string;
  bgColor: MantineColor;
  icon?: ReactNode;
  iconColor: MantineColor;
  progress: ProgressProps | null;
  onClick?: () => void;
  rows?: Row[];
};

export const StatsCard: FC<StatsCardProps> = ({
  title,
  bgColor,
  icon,
  iconColor,
  onClick,
  rows,
  progress,
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const textColor = useMemo(
    () => getContrastColor({ color: bgColor, theme, autoContrast: true}),
    [bgColor, theme],
  );

  const resolvedCircleColor = useMemo(() => {
    const overlay = textColor === theme.white
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.08)';
    return overlay;
  }, [textColor, theme]);

  const resolvedBgColor = useMemo(() => {
    const parsed = parseThemeColor({
      color: bgColor,
      theme,
      colorScheme,
    });
    return parsed.color;
  }, [bgColor, theme, colorScheme]);

  const resolvedStatBgColor = useMemo(() => {
    return lighten(
      alpha(resolvedBgColor, 0.5),
      1,
    );
  }, [resolvedBgColor]);

  const resolvedStatTextColor = useMemo(
    () => getContrastColor({
      color: resolvedStatBgColor,
      theme,
      autoContrast: true,
    }),
    [resolvedStatBgColor, theme],
  );

  return (    
    <Card shadow="xs" padding="lg" radius="md" bg={resolvedBgColor}
      className={classes.cardHover}
      style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}
    >
      <Group justify="space-between" pos="relative">
        <Box style={{ borderColor: iconColor }}>
          <Group>
            <ThemeIcon className={classes.iconBox} color={iconColor} autoContrast radius="xl" size="sm">
              {icon}
            </ThemeIcon>
          <Title order={3} c={textColor}>{title}</Title>
          </Group>
        </Box>
        <Box
          className={classes.innerCircleBox}
          style={{ background: resolvedCircleColor, zIndex: 20, }}
        ></Box>
        <Box
          className={classes.outerCircleBox}
          style={{ background: resolvedCircleColor, zIndex: 21, }}
        ></Box>
      </Group>
      <Card.Section pt='lg'>
        {progress && <Progress
          radius={0}
          styles={{
            root: {
              position: 'absolute',
              width: '100%',
              height: '15px',
              zIndex: 10,
            },
            section: {
              marginTop: '3px',
              height: '9px'
            }
          }}
          {...progress}
        />}
        <Flex w="100%" bg={resolvedStatBgColor} p={20} gap={10} direction="column" align="start">
          {rows?.map((row, i) => (
            <Group key={i} w="100%" p="apart" align="center" gap="sm">
              <Group align="center" gap="xs">
                {row.icon && (
                  <ThemeIcon
                    c={resolvedStatTextColor}
                    size="sm"
                    color={iconColor}
                    radius="xl"
                    style={{ background: 'transparent' }}
                  >
                    {row.icon}
                  </ThemeIcon>
                )}
                <Text c={resolvedStatTextColor} fw={600}>
                  {row.left}
                </Text>
              </Group>

              {row.right && (
                <Text c={resolvedStatTextColor} fw={500} ta={"right"}>
                  {row.right}
                </Text>
              )}
            </Group>
          ))}
        </Flex>
      </Card.Section>
    </Card>
  );
}
