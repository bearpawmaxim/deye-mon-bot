import { FC } from 'react';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Box,
  Flex,
  useMantineColorScheme,
  Switch,
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type BuildingData = {
  name: string;
  autonomousPowerPercent: number;
  autonomousPowerTime: string;
  gridPowerStatus: 'Connected' | 'Disconnected';
};

const buildingsData: BuildingData[] = [
  {
    name: 'Building 1',
    autonomousPowerPercent: 64.0,
    autonomousPowerTime: '~39:19',
    gridPowerStatus: 'Connected',
  },
  {
    name: 'Building 2',
    autonomousPowerPercent: 98.5,
    autonomousPowerTime: '~120:00',
    gridPowerStatus: 'Disconnected',
  },
  {
    name: 'Building 3',
    autonomousPowerPercent: 25.0,
    autonomousPowerTime: '~15:00',
    gridPowerStatus: 'Connected',
  },
];

const getAutonomousPowerColor = (percent: number): string => {
  if (percent >= 70) return 'green';
  if (percent >= 40) return 'yellow';
  return 'red';
};

const getBatteryEmoji = (percent: number): string => {
  if (percent >= 70) return '🔋';
  if (percent >= 40) return '🔋';
  return '🪫';
};

const PublicHeader: FC = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Box
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-body)',
      }}
      py="lg"
    >
      <Container size="xl" px="xl">
        <Flex justify="space-between" align="center">
          <Title order={2}>Power Monitoring</Title>
          <Flex align="center" gap="md">
            <FontAwesomeIcon
              icon="sun"
              color={
                colorScheme === 'light'
                  ? 'var(--mantine-color-gray-8)'
                  : 'var(--mantine-color-gray-3)'
              }
            />
            <Switch
              checked={colorScheme === 'dark'}
              onChange={() =>
                setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
              }
              styles={{
                track: {
                  cursor: 'pointer',
                  border: 0,
                  background:
                    'linear-gradient(90deg, var(--mantine-color-orange-6) 0%, var(--mantine-color-yellow-4) 100%)',
                },
              }}
              size="md"
            />
            <FontAwesomeIcon
              icon="moon"
              color={
                colorScheme === 'light'
                  ? 'var(--mantine-color-gray-8)'
                  : 'var(--mantine-color-gray-3)'
              }
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export const PublicPage: FC = () => {
  return (
    <>
      <PublicHeader />
      <Container size="xl" px="xl" py={48}>
        <Stack gap={48}>
          <Title order={1} ta="center" c="blue">
            Building Status
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {buildingsData.map((building) => (
              <Card
                key={building.name}
                shadow="md"
                radius="md"
                withBorder
                padding={0}
              >
                {/* Card Header */}
                <Card.Section withBorder py="xl" px="xl">
                  <Title order={2} ta="center" c="blue">
                    {building.name}
                  </Title>
                </Card.Section>

                {/* Card Content */}
                <Card.Section py="xl" px="xl">
                  <Stack gap="xl">
                    {/* Autonomous Power */}
                    <Box>
                      <Text fw={700} size="md" mb="sm">
                        Autonomous Power:
                      </Text>
                      <Flex align="center" gap="md" wrap="wrap">
                        <Group gap="xs" align="center">
                          <Text fw={600} size="lg" c="green">
                            {getBatteryEmoji(building.autonomousPowerPercent)}{' '}
                            {building.autonomousPowerPercent}%,
                          </Text>
                          <Text c="dimmed" size="sm">
                            ⏱️ {building.autonomousPowerTime}
                          </Text>
                        </Group>
                        <Badge
                          size="lg"
                          circle
                          color={getAutonomousPowerColor(
                            building.autonomousPowerPercent
                          )}
                        />
                      </Flex>
                    </Box>

                    {/* Grid Power */}
                    <Box>
                      <Flex justify="space-between" align="center">
                        <Text fw={700} size="md">
                          Grid Power:
                        </Text>
                        <Group gap="sm" align="center">
                          <Text fw={600}>{building.gridPowerStatus}</Text>
                          <Badge
                            size="lg"
                            circle
                            color={
                              building.gridPowerStatus === 'Connected'
                                ? 'green'
                                : 'red'
                            }
                          />
                        </Group>
                      </Flex>
                    </Box>
                  </Stack>
                </Card.Section>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </>
  );
};
