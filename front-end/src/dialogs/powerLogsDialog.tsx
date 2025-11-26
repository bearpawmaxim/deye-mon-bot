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

type DateFilter = 'today' | 'yesterday' | 'all';

const END_OF_DAY_THRESHOLD = { hours: 23, minutes: 50 };
const HISTORY_DAYS = 30;
const TIMER_INTERVAL_MS = 1000;

const ANIMATION_STYLES = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.2); }
  }
  @keyframes fadeIn {
    from { opacity: 0.7; }
    to { opacity: 1; }
  }
`;

const getDateRange = (filter: DateFilter) => {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  if (filter === 'yesterday') {
    startDate.setDate(now.getDate() - 1);
    endDate.setDate(now.getDate() - 1);
  } else if (filter === 'all') {
    startDate.setDate(now.getDate() - HISTORY_DAYS);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const isEndOfDayTime = (date: Date): boolean => {
  const threshold = new Date(date);
  threshold.setHours(END_OF_DAY_THRESHOLD.hours, END_OF_DAY_THRESHOLD.minutes, 0, 0);
  return date >= threshold;
};

const createPaddingPeriod = (startTime: string, endTime: string, isAvailable: boolean): PowerLogPeriod => {
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  return {
    startTime,
    endTime,
    isAvailable,
    durationSeconds: Math.floor(durationMs / 1000),
  };
};

const padPeriodsToFullDay = (periods: PowerLogPeriod[], filter: DateFilter): PowerLogPeriod[] => {
  if (!periods.length || filter === 'all') return periods;

  const now = new Date();
  const targetDate = filter === 'yesterday' 
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayStart = new Date(targetDate).setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999);

  const firstPeriod = periods[0];
  const lastPeriod = periods[periods.length - 1];
  const firstStart = new Date(firstPeriod.startTime).getTime();
  const lastEnd = new Date(lastPeriod.endTime).getTime();

  const result: PowerLogPeriod[] = [];

  if (firstStart > dayStart) {
    result.push(createPaddingPeriod(
      new Date(dayStart).toISOString(),
      firstPeriod.startTime,
      !firstPeriod.isAvailable
    ));
  }

  result.push(...periods);

  const shouldPadEnd = filter === 'yesterday' || !isEndOfDayTime(new Date(lastEnd));
  if (shouldPadEnd && lastEnd < dayEnd) {
    result.push(createPaddingPeriod(
      lastPeriod.endTime,
      new Date(dayEnd).toISOString(),
      !lastPeriod.isAvailable
    ));
  }

  return result;
};

const checkIsOngoing = (period: PowerLogPeriod, isLastPeriod: boolean, isToday: boolean, currentTime: Date): boolean => {
  if (!isLastPeriod || !isToday) return false;
  return isEndOfDayTime(new Date(period.endTime)) && currentTime > new Date(period.startTime);
};

const calculateOngoingDuration = (startTime: Date, currentTime: Date, originalDuration: number): number => {
  return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) - originalDuration;
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
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [currentTime, setCurrentTime] = useState(new Date());

    const loadData = useCallback((filter: DateFilter) => {
      const { startDate, endDate } = getDateRange(filter);
      dispatch(fetchPowerLogs({ buildingId, startDate, endDate }));
    }, [dispatch]);

    useEffect(() => {
      loadData(dateFilter);
      return () => { dispatch(clearPowerLogs()); };
    }, [dateFilter, loadData, dispatch]);

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), TIMER_INTERVAL_MS);
      return () => clearInterval(timer);
    }, []);

    const formatDuration = useCallback((seconds: number, roundUp = false): string => {
      const totalSeconds = roundUp && (seconds % 60) > 0 ? Math.ceil(seconds / 60) * 60 : seconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);

      if (hours > 0) return roundUp ? `${hours}h ${minutes}m` : `${hours}h ${minutes}m ${secs}s`;
      if (minutes > 0) return roundUp ? `${minutes}m` : `${minutes}m ${secs}s`;
      return `${secs}s`;
    }, []);

    const formatDateTime = useCallback((isoString: string): string => {
      const date = new Date(isoString);
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        ...(dateFilter === 'all' && { day: '2-digit', month: '2-digit', year: 'numeric' })
      };
      return date.toLocaleString('en-US', options);
    }, [dateFilter]);

    const getColorScheme = useCallback((isDark: boolean) => ({
      availableBg: isDark ? 'rgba(64, 192, 87, 0.15)' : 'rgba(64, 192, 87, 0.08)',
      unavailableBg: isDark ? 'rgba(250, 82, 82, 0.15)' : 'rgba(250, 82, 82, 0.08)',
      availableColor: isDark ? 'teal.4' : 'teal.7',
      unavailableColor: isDark ? 'red.4' : 'red.7',
    }), []);

    const paddedPeriods = useMemo(() => 
      data?.periods ? padPeriodsToFullDay(data.periods, dateFilter) : []
    , [data, dateFilter]);

    const { totalAvailable, totalUnavailable } = useMemo(() => {
      if (!paddedPeriods.length) {
        return {
          totalAvailable: formatDuration(0, true),
          totalUnavailable: formatDuration(0, true),
        };
      }

      const lastPeriod = paddedPeriods[paddedPeriods.length - 1];
      const isOngoing = checkIsOngoing(lastPeriod, true, dateFilter === 'today', currentTime);

      let totalAvailableSeconds = 0;
      let totalUnavailableSeconds = 0;

      paddedPeriods.forEach(period => {
        if (period.isAvailable) {
          totalAvailableSeconds += period.durationSeconds;
        } else {
          totalUnavailableSeconds += period.durationSeconds;
        }
      });

      if (!isOngoing) {
        return {
          totalAvailable: formatDuration(totalAvailableSeconds, true),
          totalUnavailable: formatDuration(totalUnavailableSeconds, true),
        };
      }

      const adjustment = calculateOngoingDuration(
        new Date(lastPeriod.startTime),
        currentTime,
        lastPeriod.durationSeconds
      );

      return lastPeriod.isAvailable ? {
        totalAvailable: formatDuration(totalAvailableSeconds + adjustment, false),
        totalUnavailable: formatDuration(totalUnavailableSeconds, true),
      } : {
        totalAvailable: formatDuration(totalAvailableSeconds, true),
        totalUnavailable: formatDuration(totalUnavailableSeconds + adjustment, false),
      };
    }, [paddedPeriods, dateFilter, currentTime, formatDuration]);

    const rows = useMemo(() => {
      if (!paddedPeriods.length) return [];
      
      const isDark = colorScheme === 'dark';
      const isToday = dateFilter === 'today';
      const colors = getColorScheme(isDark);
      
      return [...paddedPeriods].reverse().map((period, index) => {
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
                  <Text c={textColor} fw={700} style={{ animation: 'pulse 2s ease-in-out infinite', fontSize: '1.2em' }}>
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
                  {period.isAvailable ? 'Grid On' : 'Grid Off'}{isOngoing && ' (Now)'}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              {formatDuration(isOngoing ? durationSeconds : period.durationSeconds, !isOngoing)}
            </Table.Td>
          </Table.Tr>
        );
      });
    }, [paddedPeriods, colorScheme, dateFilter, currentTime, formatDateTime, formatDuration, getColorScheme]);

    const handleClose = () => id && modals.close(id);

    const isDark = colorScheme === 'dark';

    return (
      <Stack gap="md">
        <SegmentedControl
          value={dateFilter}
          onChange={(value) => setDateFilter(value as DateFilter)}
          data={[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: `All (${HISTORY_DAYS} days)`, value: 'all' },
          ]}
          fullWidth
        />

        {loading && <Center p="xl"><Loader size="lg" /></Center>}
        {error && <Text c="red" ta="center">Error: {error}</Text>}

        {!loading && !error && data && (
          <>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>Total Grid On:</Text>
                <Text c={isDark ? 'teal.4' : 'teal.7'}>{totalAvailable}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>Total Grid Off:</Text>
                <Text c={isDark ? 'red.4' : 'red.7'}>{totalUnavailable}</Text>
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
                      <Text ta="center" c="dimmed">No data for the selected period</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>Close</Button>
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
