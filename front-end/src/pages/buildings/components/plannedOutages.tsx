import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Alert, Badge, Box, Card, Group, Loader, SimpleGrid, Stack, Text, Title, useMantineColorScheme } from "@mantine/core";
import { FC, useCallback, useEffect, useState } from "react";


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

type PlannedOutagesProps = {
  outageQueue: string;
};

export const PlannedOutages: FC<PlannedOutagesProps> = ({ outageQueue }) => {
    const fetchYasnoData = useCallback(async (queue: string): Promise<ProcessedData | null> => {
    const addMinutesToMidnight = (minutes: number): string => {
      const hours = Math.floor(minutes / 60) % 24;
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    };

    try {
        const response = await fetch("/api/yasno/planned-outages?region=25&dso=902", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
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
    }, []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outageData, setOutageData] = useState<ProcessedData | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchYasnoData(outageQueue);
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
  }, [outageQueue, fetchYasnoData]);

  useEffect(() => {
    loadData();
    // Refresh every 30 minutes
    const interval = setInterval(() => loadData(), 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

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
          Planned Power Outages Schedule (Queue {outageQueue})
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