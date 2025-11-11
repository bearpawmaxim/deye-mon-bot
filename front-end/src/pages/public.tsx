import { FC, useState, useEffect } from "react";
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
  Loader,
  Alert,
  ActionIcon,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemePicker } from "../components";

type BuildingData = {
  name: string;
  autonomousPowerPercent: number;
  autonomousPowerTime: string;
  gridPowerStatus: "Connected" | "Disconnected";
  headerBgColor: string;
  headerTextColor: string;
};

type TimeSlot = {
  start: number;
  end: number;
  type: string;
};

type DayData = {
  slots: TimeSlot[];
  date?: string;
  status?: string;
};

type QueueData = {
  today?: DayData;
  tomorrow?: DayData;
  updatedOn?: string;
};

type YasnoData = {
  [key: string]: QueueData;
};

type ProcessedSlot = {
  start: string;
  end: string;
};

type ProcessedData = {
  today: ProcessedSlot[];
  tomorrow: ProcessedSlot[];
  updatedOn?: string;
};

const buildingsData: BuildingData[] = [
  {
    name: "Building 1",
    autonomousPowerPercent: 64.0,
    autonomousPowerTime: "~39:19",
    gridPowerStatus: "Connected",
    headerBgColor: "#A7C7E7",
    headerTextColor: "#1e3a5f", 
  },
  {
    name: "Building 2",
    autonomousPowerPercent: 98.5,
    autonomousPowerTime: "~120:00",
    gridPowerStatus: "Disconnected",
    headerBgColor: "#F6C8A2",
    headerTextColor: "#8b4513", 
  },
  {
    name: "Building 3",
    autonomousPowerPercent: 25.0,
    autonomousPowerTime: "~15:00",
    gridPowerStatus: "Connected",
    headerBgColor: "#B6E3B5",
    headerTextColor: "#2d5016", 
  },
];

const getAutonomousPowerColor = (percent: number): string => {
  if (percent >= 70) return "green";
  if (percent >= 40) return "yellow";
  return "red";
};

const getBatteryEmoji = (percent: number): string => {
  if (percent >= 70) return "🔋";
  if (percent >= 40) return "🔋";
  return "🪫";
};

const YASNO_URL = "https://app.yasno.ua/api/blackout-service";
const YASNO_QUEUE = "6.2";

const addMinutesToMidnight = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

const fetchYasnoData = async (queue: string): Promise<ProcessedData | null> => {
  // Using CORS proxy to bypass CORS restrictions 😂😂😂
  const corsProxy = "https://api.cors.lol/?url=";
  const apiUrl = `${YASNO_URL}/public/shutdowns/regions/25/dsos/902/planned-outages`;
  const url = `${corsProxy}${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const dashboard: YasnoData = await response.json();
    const queueData = dashboard[queue];

    if (!queueData) {
      return null;
    }

    const todaySlots =
      queueData.today?.slots
        ?.filter((e) => e.type === "Definite")
        .map((e) => ({
          start: addMinutesToMidnight(e.start),
          end: addMinutesToMidnight(e.end),
        })) || [];

    const tomorrowSlots =
      queueData.tomorrow?.slots
        ?.filter((e) => e.type === "Definite")
        .map((e) => ({
          start: addMinutesToMidnight(e.start),
          end: addMinutesToMidnight(e.end),
        })) || [];

    return {
      today: todaySlots,
      tomorrow: tomorrowSlots,
      updatedOn: queueData.updatedOn,
    };
  } catch (e) {
    console.error("Error fetching YASNO data:", e);
    return null;
  }
};

const PlannedOutages: FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outageData, setOutageData] = useState<ProcessedData | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchYasnoData(YASNO_QUEUE);
      setOutageData(data);
    } catch {
      setError("Failed to load planned outages data");
    } finally {
      if (isManualRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 minutes 😂😂😂
    const interval = setInterval(() => loadData(), 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box ta="center" py="xl">
        <Loader size="lg" />
        <Text mt="md" c="dimmed">
          Loading planned outages from YASNO...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    );
  }

  if (!outageData) {
    return (
      <Box ta="center" py="xl">
        <Alert color="yellow" title="No Data Available">
          <Stack gap="sm">
            <Text size="sm">
              Unable to fetch data from YASNO API. Please try again later.
            </Text>
            <Group justify="center">
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={() => loadData(true)}
                disabled={refreshing}
              >
                <Box
                  style={{
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesomeIcon icon="refresh" />
                </Box>
              </ActionIcon>
            </Group>
          </Stack>
        </Alert>
      </Box>
    );
  }

  const hasTodayOutages = outageData && outageData.today.length > 0;
  const hasTomorrowOutages = outageData && outageData.tomorrow.length > 0;

  const renderOutageSlots = (slots: ProcessedSlot[]) => {
    if (slots.length === 0) {
      return (
        <Box ta="center" py="md">
          <Text size="sm" c="dimmed">
            No outages
          </Text>
        </Box>
      );
    }

    return (
      <Stack gap="xs">
        {slots.map((slot, idx) => (
          <Box
            key={idx}
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
              {slot.start} - {slot.end}
            </Text>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Stack gap="lg">
      <Group justify="center" align="center" gap="md">
        <Title order={2}>
          Planned Power Outages Schedule (Queue {YASNO_QUEUE})
        </Title>
        <ActionIcon
          variant="light"
          color="blue"
          size="lg"
          onClick={() => loadData(true)}
          title="Refresh data"
          disabled={refreshing}
        >
          <Box
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon="refresh" />
          </Box>
        </ActionIcon>
      </Group>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* Today */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={600} size="lg">
                Today
              </Text>
              {hasTodayOutages && (
                <Badge color="red" variant="light">
                  {outageData.today.length}
                </Badge>
              )}
            </Group>
            {renderOutageSlots(outageData?.today || [])}
          </Stack>
        </Card>

        {/* Tomorrow */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={600} size="lg">
                Tomorrow
              </Text>
              {hasTomorrowOutages && (
                <Badge color="red" variant="light">
                  {outageData.tomorrow.length}
                </Badge>
              )}
            </Group>
            {renderOutageSlots(outageData?.tomorrow || [])}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Updated On */}
      {outageData?.updatedOn && (
        <Text size="xs" c="dimmed" ta="center">
          Last updated: {formatDate(outageData.updatedOn)}
        </Text>
      )}
    </Stack>
  );
};

const PublicHeader: FC = () => {
  return (
    <Box
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-body)",
      }}
      py="lg"
    >
      <Container size="xl" px="xl">
        <Flex justify="space-between" align="center">
          <Title order={2}>Power Monitoring</Title>
          <ThemePicker isNavbarCollapsed={false} size="md" />
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
            SVITLO PARK 
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
                <Card.Section 
                  withBorder 
                  py="xl" 
                  px="xl"
                  style={{ backgroundColor: building.headerBgColor }}
                >
                  <Title 
                    order={2} 
                    ta="center" 
                    style={{ color: building.headerTextColor }}
                  >
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
                            {getBatteryEmoji(building.autonomousPowerPercent)}{" "}
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
                              building.gridPowerStatus === "Connected"
                                ? "green"
                                : "red"
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

          {/* Planned Outages Section */}
          <PlannedOutages />
        </Stack>
      </Container>
    </>
  );
};
