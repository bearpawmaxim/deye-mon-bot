import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Alert, Box, Group, Loader, SimpleGrid, Stack, Text, Title, useMantineColorScheme } from "@mantine/core";
import { FC } from "react";
import { toLocalDateTime } from "../../../utils";
import { DayOutageSchedule } from "./dayOutageSchedule";
import { OutagesScheduleData } from "../../../stores/types";

type PlannedOutagesProps = {
  outageQueue: string;
  data: OutagesScheduleData;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export const PlannedOutages: FC<PlannedOutagesProps> = ({ outageQueue, data, loading, error, onRefresh }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

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

  if (error) {
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
                onClick={() => onRefresh()}
                disabled={loading}
              >
                <Box
                  style={{
                    animation: loading ? "spin 1s linear infinite" : "none",
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
          onClick={() => onRefresh()}
          title="Refresh data"
          disabled={loading}
        >
          <Box
            style={{
              animation: loading ? "spin 1s linear infinite" : "none",
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
        <DayOutageSchedule title="Today" isDark={isDark} dayData={data?.today} isToday={true} />

        {/* Tomorrow */}
        <DayOutageSchedule title="Tomorrow" isDark={isDark} dayData={data?.tomorrow} isToday={false} />
      </SimpleGrid>

      {/* Updated On */}
      {data?.updatedOn && (
        <Text size="xs" c="dimmed" ta="center">
          Last updated: {toLocalDateTime(data.updatedOn)}
        </Text>
      )}
    </Stack>
  );
};