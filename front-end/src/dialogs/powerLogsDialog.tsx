import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Group, Stack, Table, Text, SegmentedControl, Loader, Center, useMantineColorScheme } from "@mantine/core";
import { RootState, useAppDispatch } from "../stores/store";
import { fetchPowerLogs } from "../stores/thunks";
import { clearPowerLogs } from "../stores/slices";
import { connect } from "react-redux";
import { PowerLogPeriod, PowerLogsData } from "../stores/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type OpenPowerLogsDialogOptions = {
  buildingId: number;
  buildingName: string;
};

const END_OF_DAY_THRESHOLD_HOURS = 23;
const END_OF_DAY_THRESHOLD_MINUTES = 50;
const HISTORY_DAYS = 30;
const TIMER_INTERVAL_MS = 1000;

const ANIMATION_STYLES = `
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.4; 
      transform: scale(1.2);
    }
  }
  @keyframes fadeIn {
    from { opacity: 0.7; }
    to { opacity: 1; }
  }
`;

const getDateRange = (filter: 'today' | 'yesterday' | 'all') => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  
  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'all':
      startDate.setDate(now.getDate() - HISTORY_DAYS);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const isEndOfDayTime = (date: Date): boolean => {
  const threshold = new Date(date);
  threshold.setHours(END_OF_DAY_THRESHOLD_HOURS, END_OF_DAY_THRESHOLD_MINUTES, 0, 0);
  return date >= threshold;
};

const checkIsOngoing = (
  period: PowerLogPeriod,
  isLastPeriod: boolean,
  isToday: boolean,
  currentTime: Date
): boolean => {
  if (!isLastPeriod || !isToday) return false;
  
  const endTime = new Date(period.endTime);
  const startTime = new Date(period.startTime);
  
  return isEndOfDayTime(endTime) && currentTime > startTime;
};

const calculateOngoingDuration = (
  startTime: Date,
  currentTime: Date,
  originalDuration: number
): number => {
  const currentDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  return currentDuration - originalDuration;
};

export function openPowerLogsDialog({ buildingId, buildingName }: OpenPowerLogsDialogOptions) {
  type InnerProps = {
    loading: boolean;
    error: string | null;
    data: PowerLogsData | null;
  };

  const mapStateToProps = (state: RootState): InnerProps => ({
    loading: state.powerLogs.loading,
    error: state.powerLogs.error,
    data: state.powerLogs.data,
  });

  const Inner: FC<InnerProps> = ({ loading, error, data }) => {
    const dispatch = useAppDispatch();
    const { colorScheme } = useMantineColorScheme();
    const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all'>('today');
    const [currentTime, setCurrentTime] = useState(new Date());

    const loadData = useCallback((filter: 'today' | 'yesterday' | 'all') => {
      const { startDate, endDate } = getDateRange(filter);
      dispatch(fetchPowerLogs({ buildingId, startDate, endDate }));
    }, [dispatch]);

    useEffect(() => {
      loadData(dateFilter);
      return () => {
        dispatch(clearPowerLogs());
      };
    }, [dateFilter, loadData, dispatch]);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, TIMER_INTERVAL_MS);
      return () => clearInterval(timer);
    }, []);

    const formatDuration = useCallback((seconds: number, roundUp: boolean = false): string => {
      let totalSeconds = seconds;
      
      if (roundUp && (seconds % 60) > 0) {
        totalSeconds = Math.ceil(seconds / 60) * 60;
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);
      
      if (hours > 0) {
        return roundUp ? `${hours}h ${minutes}m` : `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return roundUp ? `${minutes}m` : `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    }, []);

    const formatDateTime = useCallback((isoString: string): string => {
      const date = new Date(isoString);
      const showFullDate = dateFilter === 'all';
      
      if (showFullDate) {
        return date.toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
      
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }, [dateFilter]);

    const getColorScheme = useCallback((isDark: boolean) => ({
      availableBg: isDark ? 'rgba(64, 192, 87, 0.15)' : 'rgba(64, 192, 87, 0.08)',
      unavailableBg: isDark ? 'rgba(250, 82, 82, 0.15)' : 'rgba(250, 82, 82, 0.08)',
      availableColor: isDark ? 'teal.4' : 'teal.7',
      unavailableColor: isDark ? 'red.4' : 'red.7',
    }), []);

    const { totalAvailable, totalUnavailable } = useMemo(() => {
      if (!data?.periods.length) {
        return {
          totalAvailable: formatDuration(data?.totalAvailableSeconds ?? 0, true),
          totalUnavailable: formatDuration(data?.totalUnavailableSeconds ?? 0, true),
        };
      }

      const lastPeriod = data.periods[data.periods.length - 1];
      const isOngoing = checkIsOngoing(lastPeriod, true, dateFilter === 'today', currentTime);

      if (!isOngoing) {
        return {
          totalAvailable: formatDuration(data.totalAvailableSeconds, true),
          totalUnavailable: formatDuration(data.totalUnavailableSeconds, true),
        };
      }

      const adjustment = calculateOngoingDuration(
        new Date(lastPeriod.startTime),
        currentTime,
        lastPeriod.durationSeconds
      );

      if (lastPeriod.isAvailable) {
        return {
          totalAvailable: formatDuration(data.totalAvailableSeconds + adjustment, false),
          totalUnavailable: formatDuration(data.totalUnavailableSeconds, true),
        };
      }

      return {
        totalAvailable: formatDuration(data.totalAvailableSeconds, true),
        totalUnavailable: formatDuration(data.totalUnavailableSeconds + adjustment, false),
      };
    }, [data, dateFilter, currentTime, formatDuration]);

    const rows = useMemo(() => {
      if (!data?.periods) return [];
      const isDark = colorScheme === 'dark';
      const isToday = dateFilter === 'today';
      const colors = getColorScheme(isDark);
      
      return [...data.periods].reverse().map((period: PowerLogPeriod, index: number) => {
        const isLastPeriod = index === 0;
        const isOngoing = checkIsOngoing(period, isLastPeriod, isToday, currentTime);
        const startTime = new Date(period.startTime);
        const effectiveEndTime = isOngoing ? currentTime : new Date(period.endTime);
        const durationSeconds = Math.floor((effectiveEndTime.getTime() - startTime.getTime()) / 1000);
        
        const bgColor = period.isAvailable ? colors.availableBg : colors.unavailableBg;
        const textColor = period.isAvailable ? colors.availableColor : colors.unavailableColor;
        
        return (
          <Table.Tr key={index} bg={bgColor}>
            <Table.Td>{formatDateTime(period.startTime)}</Table.Td>
            <Table.Td>
              {isOngoing ? (
                <Group gap="xs" wrap="nowrap">
                  <Text fw={600} style={{ animation: 'fadeIn 0.5s ease-in' }}>
                    {formatDateTime(currentTime.toISOString())}
                  </Text>
                  <Text 
                    c={textColor} 
                    fw={700}
                    style={{ animation: 'pulse 2s ease-in-out infinite', fontSize: '1.2em' }}
                  >
                    ●
                  </Text>
                </Group>
              ) : (
                <Text>{formatDateTime(period.endTime)}</Text>
              )}
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                {period.isAvailable ? (
                  <FontAwesomeIcon icon="lightbulb" color={textColor} />
                ) : (
                  <span className="fa-layers fa-fw">
                    <FontAwesomeIcon icon="lightbulb" color={textColor} />
                    <FontAwesomeIcon icon="slash" color={textColor} />
                  </span>
                )}
                <Text fw={600} c={textColor}>
                  {period.isAvailable ? 'Grid On' : 'Grid Off'}
                  {isOngoing && ' (Now)'}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>{formatDuration(isOngoing ? durationSeconds : period.durationSeconds, !isOngoing)}</Table.Td>
          </Table.Tr>
        );
      });
    }, [data, colorScheme, dateFilter, currentTime, formatDateTime, formatDuration, getColorScheme]);

    const handleClose = () => {
      if (id) {
        modals.close(id);
      }
    };

    return (
      <Stack gap="md">
        <SegmentedControl
          value={dateFilter}
          onChange={(value) => setDateFilter(value as 'today' | 'yesterday' | 'all')}
          data={[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: `All (${HISTORY_DAYS} days)`, value: 'all' },
          ]}
          fullWidth
        />

        {loading && (
          <Center p="xl">
            <Loader size="lg" />
          </Center>
        )}

        {error && (
          <Text c="red" ta="center">
            Error: {error}
          </Text>
        )}

        {!loading && !error && data && (
          <>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>Total Grid On:</Text>
                <Text c={colorScheme === 'dark' ? 'teal.4' : 'teal.7'}>
                  {totalAvailable}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>Total Grid Off:</Text>
                <Text c={colorScheme === 'dark' ? 'red.4' : 'red.7'}>
                  {totalUnavailable}
                </Text>
              </Group>
            </Stack>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Start Time</Table.Th>
                  <Table.Th>End Time</Table.Th>
                  <Table.Th>State</Table.Th>
                  <Table.Th>Duration</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed">
                        No data for the selected period
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Close
          </Button>
        </Group>
      </Stack>
    );
  };

  const ConnectedInner = connect(mapStateToProps)(Inner);

  const id: string | undefined = modals.open({
    title: `Power Statistics: ${buildingName}`,
    centered: true,
    size: "xl",
    children: (
      <>
        <style>{ANIMATION_STYLES}</style>
        <ConnectedInner />
      </>
    ),
  });
}
