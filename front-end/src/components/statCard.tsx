import { Box, Card, Flex, Group, MantineColor, Text, ThemeIcon, useMantineTheme, useMantineColorScheme, getContrastColor, Title, alpha, lighten, parseThemeColor, Progress, ProgressProps, LoadingOverlay } from "@mantine/core"
import { FC, ReactNode, useMemo, useRef, useState } from "react"
import classes from './styles/statCard.module.css';

type Row = {
  icon?: ReactNode;
  left: ReactNode;
  right?: ReactNode;
};

type StatsCardProps = {
  christmasTree: boolean;
  title: string;
  bgColor: MantineColor;
  icon?: ReactNode;
  iconColor: MantineColor;
  progress: ProgressProps | null;
  onClick?: () => void;
  rows?: Row[];
  loading: boolean;
};

export const StatsCard: FC<StatsCardProps> = ({
  christmasTree = false,
  title,
  bgColor,
  icon,
  iconColor,
  onClick,
  rows,
  progress,
  loading,
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

  const [hovered, setHovered] = useState(false);

  const treesRef = useRef<
    { scale: number; x: number; opacity: number; zIndex: number }[]
  >([]);

  if (treesRef.current.length === 0) {
    const rand = (min: number, max: number) =>
      // eslint-disable-next-line react-hooks/purity
      Math.random() * (max - min) + min;

    const TREE_COUNT = 6;
    const BASE_STEP = 90;

    treesRef.current = Array.from({ length: TREE_COUNT }).map((_, i) => {

      if (i === 0) {
        return {
          scale: 1,
          x: 0,
          opacity: 1,
          zIndex: 10,
        };
      }

      const scale = rand(0.9, 0.3);
      const opacity = rand(0.3, 0.6);

      return {
        scale,
        x: i * BASE_STEP + rand(-30, 30),
        opacity: opacity,
        zIndex: Math.round(scale * 10),
      };
    });
  }

  return (    
    <Card shadow="xs" padding="lg" radius="md"
      bg={resolvedBgColor}
      className={classes.cardHover}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        position: 'relative',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {christmasTree && (
        <Box className={classes.treesContainer}>
          {treesRef.current.map((t, i) => {
            const parallaxX = i === 0
              ? 0
              : hovered
                ? (0.5 - t.scale) * 50
                : 0;
            const baseY = i === 0 ? 40 : 10;

            return <Box
              key={i}
              className={classes.treeWrapper}
              style={{
                transform: `
                  translate(${t.x + parallaxX}px, ${baseY}px)
                  scale(${t.scale})
                `,
                opacity: t.opacity,
                zIndex: t.zIndex,
              }}
            >
              <Box className={classes.treeTriangle1} />
              <Box className={classes.treeTriangle2} />
              <Box className={classes.treeTriangle3} />
            </Box>
          })}
        </Box>
      )}
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
        <Flex mt="sm" w="100%" bg={resolvedStatBgColor} p={20} gap={10} direction="column" align="start">
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ type: 'bars' }}
          />
          {rows?.map((row, i) => (
            <Group key={i} w="100%" p="apart" align="center" gap="sm" >
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
                <Text c={resolvedStatTextColor} fw={500}>
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
