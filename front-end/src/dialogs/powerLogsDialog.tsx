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

    const getDateRange = useCallback((filter: 'today' | 'yesterday' | 'all') => {
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
          startDate.setDate(now.getDate() - 30); // Last 30 days
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }, []);

    const loadData = useCallback((filter: 'today' | 'yesterday' | 'all') => {
      const { startDate, endDate } = getDateRange(filter);
      dispatch(fetchPowerLogs({ buildingId, startDate, endDate }));
    }, [dispatch, getDateRange]);

    useEffect(() => {
      loadData(dateFilter);
      return () => {
        dispatch(clearPowerLogs());
      };
    }, [dateFilter, loadData, dispatch]);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const handleFilterChange = (value: string) => {
      setDateFilter(value as 'today' | 'yesterday' | 'all');
    };

    const formatDuration = (seconds: number, roundUp: boolean = false): string => {
      let totalSeconds = seconds;
      
      // Round up to next minute if requested and there are any seconds
      if (roundUp && (seconds % 60) > 0) {
        totalSeconds = Math.ceil(seconds / 60) * 60;
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);
      
      if (hours > 0) {
        if (roundUp) {
          return `${hours}h ${minutes}m`;
        }
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        if (roundUp) {
          return `${minutes}m`;
        }
        return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    };

    const formatDateTime = useCallback((isoString: string, showDateOnly: boolean = false): string => {
      const date = new Date(isoString);
      
      // For Today and Yesterday filters, show only time
      if ((dateFilter === 'today' || dateFilter === 'yesterday') && !showDateOnly) {
        return date.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
      
      // For All filter, show full date and time
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }, [dateFilter]);

    const rows = useMemo(() => {
      if (!data?.periods) return [];
      const isDark = colorScheme === 'dark';
      const isToday = dateFilter === 'today';
      
      return data.periods.map((period: PowerLogPeriod, index: number) => {
        // More subtle, harmonious colors
        const availableBg = isDark ? 'rgba(64, 192, 87, 0.15)' : 'rgba(64, 192, 87, 0.08)';
        const unavailableBg = isDark ? 'rgba(250, 82, 82, 0.15)' : 'rgba(250, 82, 82, 0.08)';
        const availableColor = isDark ? 'teal.4' : 'teal.7';
        const unavailableColor = isDark ? 'red.4' : 'red.7';
        
        // Check if this is the last period and it's ongoing
        const isLastPeriod = index === data.periods.length - 1;
        const endTime = new Date(period.endTime);
        const startTime = new Date(period.startTime);
        const now = currentTime;
        
        // Check if end time is close to end of day (23:50 - 23:59:59)
        const endOfDay = new Date(endTime);
        endOfDay.setHours(23, 50, 0, 0);
        const isEndOfDay = endTime >= endOfDay;
        
        // This period is ongoing if it's the last one, today filter, and end time is near midnight
        const isOngoing = isLastPeriod && isToday && isEndOfDay && now > startTime;
        
        // Calculate duration
        const effectiveEndTime = isOngoing ? now : endTime;
        const durationSeconds = Math.floor((effectiveEndTime.getTime() - startTime.getTime()) / 1000);
        
        return (
          <Table.Tr key={index} bg={period.isAvailable ? availableBg : unavailableBg}>
            <Table.Td>{formatDateTime(period.startTime)}</Table.Td>
            <Table.Td>
              {isOngoing ? (
                <Group gap="xs" wrap="nowrap">
                  <Text 
                    fw={600}
                    style={{ 
                      animation: 'fadeIn 0.5s ease-in',
                    }}
                  >
                    {formatDateTime(now.toISOString())}
                  </Text>
                  <Text 
                    c={period.isAvailable ? availableColor : unavailableColor} 
                    fw={700}
                    style={{ 
                      animation: 'pulse 2s ease-in-out infinite',
                      fontSize: '1.2em',
                    }}
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
                  <FontAwesomeIcon icon="lightbulb" color={availableColor} />
                ) : (
                  <span className="fa-layers fa-fw">
                    <FontAwesomeIcon icon="lightbulb" color={unavailableColor} />
                    <FontAwesomeIcon icon="slash" color={unavailableColor} />
                  </span>
                )}
                <Text fw={600} c={period.isAvailable ? availableColor : unavailableColor}>
                  {period.isAvailable ? 'Grid On' : 'Grid Off'}
                  {isOngoing && ' (Now)'}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>{formatDuration(isOngoing ? durationSeconds : period.durationSeconds, !isOngoing)}</Table.Td>
          </Table.Tr>
        );
      });
    }, [data, colorScheme, dateFilter, currentTime, formatDateTime]);

    const handleClose = () => {
      if (id) {
        modals.close(id);
      }
    };

    return (
      <Stack gap="md">
        <SegmentedControl
          value={dateFilter}
          onChange={handleFilterChange}
          data={[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: 'All (30 days)', value: 'all' },
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
                  {(() => {
                    if (!data.periods.length) return formatDuration(data.totalAvailableSeconds, true);
                    const lastPeriod = data.periods[data.periods.length - 1];
                    const endTime = new Date(lastPeriod.endTime);
                    const startTime = new Date(lastPeriod.startTime);
                    const now = currentTime;
                    
                    // Check if end time is close to end of day
                    const endOfDay = new Date(endTime);
                    endOfDay.setHours(23, 50, 0, 0);
                    const isEndOfDay = endTime >= endOfDay;
                    const isOngoing = dateFilter === 'today' && isEndOfDay && now > startTime;
                    
                    if (isOngoing && lastPeriod.isAvailable) {
                      const currentDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                      const adjustment = currentDuration - lastPeriod.durationSeconds;
                      // Don't round up for ongoing duration
                      return formatDuration(data.totalAvailableSeconds + adjustment, false);
                    }
                    return formatDuration(data.totalAvailableSeconds, true);
                  })()}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>Total Grid Off:</Text>
                <Text c={colorScheme === 'dark' ? 'red.4' : 'red.7'}>
                  {(() => {
                    if (!data.periods.length) return formatDuration(data.totalUnavailableSeconds, true);
                    const lastPeriod = data.periods[data.periods.length - 1];
                    const endTime = new Date(lastPeriod.endTime);
                    const startTime = new Date(lastPeriod.startTime);
                    const now = currentTime;
                    
                    // Check if end time is close to end of day
                    const endOfDay = new Date(endTime);
                    endOfDay.setHours(23, 50, 0, 0);
                    const isEndOfDay = endTime >= endOfDay;
                    const isOngoing = dateFilter === 'today' && isEndOfDay && now > startTime;
                    
                    if (isOngoing && !lastPeriod.isAvailable) {
                      const currentDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                      const adjustment = currentDuration - lastPeriod.durationSeconds;
                      // Don't round up for ongoing duration
                      return formatDuration(data.totalUnavailableSeconds + adjustment, false);
                    }
                    return formatDuration(data.totalUnavailableSeconds, true);
                  })()}
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
        <style>{`
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
        `}</style>
        <ConnectedInner />
      </>
    ),
  });
}

