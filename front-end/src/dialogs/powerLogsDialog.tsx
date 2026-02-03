import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Group, Stack, Table, Text, SegmentedControl, Loader, Center, useMantineColorScheme, ScrollArea, ActionIcon } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../stores/store";
import { fetchPowerLogs } from "../stores/thunks";
import { clearPowerLogs } from "../stores/slices";
import { PowerLogPeriod } from "../stores/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ObjectId } from "../schemas";
import { TFunction } from "i18next";
import { formatDateTime, formatDuration, getThisWeekDates } from "../utils";
import DateRangePicker from "../components/dateRangePicker";
import { DateRange } from "../types";
import i18n from "../i18n";


type OpenPowerLogsDialogOptions = {
  t: TFunction;
  buildingId: ObjectId;
  buildingName: string;
};

type DateFilter = 'today' | 'yesterday' | 'custom';

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

const getDateRange = (filter: DateFilter, customDates?: DateRange) => {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  if (filter === 'yesterday') {
    startDate.setDate(now.getDate() - 1);
    endDate.setDate(now.getDate() - 1);
  } else if (filter === 'custom' && customDates?.from && customDates?.to) {
    const customStart = new Date(customDates.from);
    const customEnd = new Date(customDates.to);
    customStart.setHours(0, 0, 0, 0);

    const isEndDateToday = customEnd.toDateString() === now.toDateString();
    if (isEndDateToday) {
      customEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    } else {
      customEnd.setHours(23, 59, 59, 999);
    }

    return {
      startDate: customStart.toISOString(),
      endDate: customEnd.toISOString(),
    };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const padPeriodsToFullDay = (periods: PowerLogPeriod[]): PowerLogPeriod[] => {
  return periods;
};

const checkIsOngoing = (period: PowerLogPeriod, isLastPeriod: boolean, isToday: boolean, currentTime: Date): boolean => {
  if (!isLastPeriod || !isToday) return false;
  const endTime = new Date(period.endTime);
  return endTime.getHours() >= 23 && currentTime > new Date(period.startTime);
};

const calculateOngoingDuration = (startTime: Date, currentTime: Date, originalDuration: number): number => {
  return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) - originalDuration;
};

export function openPowerLogsDialog({ buildingId: initialBuildingId, buildingName: initialBuildingName, t }: OpenPowerLogsDialogOptions) {

  const Inner: FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error, data } = useAppSelector(state => state.powerLogs);
    const buildings = useAppSelector(state => state.buildings.items);

    const { colorScheme } = useMantineColorScheme();
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [customDateRange, setCustomDateRange] = useState<DateRange>(getThisWeekDates());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentBuildingId, setCurrentBuildingId] = useState(initialBuildingId);

    const currentBuildingName = useMemo(() => {
      if (currentBuildingId === initialBuildingId) return initialBuildingName;
      const building = buildings.find(b => b.id === currentBuildingId);
      if (building) {
        return building.name[i18n.language] || Object.values(building.name)[0] || '';
      }
      return '';
    }, [buildings, currentBuildingId, initialBuildingId, initialBuildingName]);

    const loadData = useCallback((filter: DateFilter, customDates?: DateRange) => {
      if (filter === 'custom' && (!customDates?.from || !customDates?.to)) {
        return;
      }
      const { startDate, endDate } = getDateRange(filter, customDates);
      dispatch(fetchPowerLogs({ buildingId: currentBuildingId, startDate, endDate }));
    }, [dispatch, currentBuildingId]);

    useEffect(() => {
      if (dateFilter === 'custom' && (!customDateRange.from || !customDateRange.to)) {
        return;
      }
      loadData(dateFilter, dateFilter === 'custom' ? customDateRange : undefined);
      return () => { dispatch(clearPowerLogs()); };
    }, [dateFilter, customDateRange, loadData, dispatch, currentBuildingId]);

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), TIMER_INTERVAL_MS);
      return () => clearInterval(timer);
    }, []);

    const getColorScheme = useCallback((isDark: boolean) => ({
      availableBg: isDark ? 'rgba(64, 192, 87, 0.15)' : 'rgba(64, 192, 87, 0.08)',
      unavailableBg: isDark ? 'rgba(250, 82, 82, 0.15)' : 'rgba(250, 82, 82, 0.08)',
      availableColor: isDark ? 'teal.4' : 'teal.7',
      unavailableColor: isDark ? 'red.4' : 'red.7',
    }), []);

    const paddedPeriods = useMemo(() =>
      data?.periods ? padPeriodsToFullDay(data.periods) : []
      , [data]);

    const totalGeneratorTime = useMemo(() => {
      if (!data) {
        return formatDuration(0, true);
      }
      return formatDuration(data.totalGeneratorSeconds, true);
    }, [data]);

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
    }, [paddedPeriods, dateFilter, currentTime]);

    const rows = useMemo(() => {
      if (!paddedPeriods.length) {
        return [];
      }
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
                  {period.isAvailable ? t('powerLogs.table.gridOnState') : t('powerLogs.table.gridOffState')}
                  {isOngoing && ` (${t('time.now').toLocaleLowerCase()})`}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              {formatDuration(isOngoing ? durationSeconds : period.durationSeconds, !isOngoing)}
            </Table.Td>
          </Table.Tr>
        );
      });
    }, [paddedPeriods, colorScheme, dateFilter, currentTime, getColorScheme]);

    const handleClose = () => id && modals.close(id);
    const handleNext = () => {
      const idx = buildings.findIndex(b => b.id === currentBuildingId);
      if (idx !== -1) {
        const nextIdx = (idx + 1) % buildings.length;
        const nextId = buildings[nextIdx].id;
        if (nextId) setCurrentBuildingId(nextId);
      }
    };
    const handlePrev = () => {
      const idx = buildings.findIndex(b => b.id === currentBuildingId);
      if (idx !== -1) {
        const prevIdx = (idx - 1 + buildings.length) % buildings.length;
        const prevId = buildings[prevIdx].id;
        if (prevId) setCurrentBuildingId(prevId);
      }
    };

    const isDark = colorScheme === 'dark';

    return (
      <Stack gap="md">
        <Group justify="center" align="center" gap="md" py="xs">
          <ActionIcon variant="transparent" onClick={handlePrev} size="lg">
            <FontAwesomeIcon icon='chevron-left' />
          </ActionIcon>
          <Text fw={700} size="lg" ta="center" style={{ flexGrow: 1, maxWidth: '80%' }}>
            {currentBuildingName}
          </Text>
          <ActionIcon variant="transparent" onClick={handleNext} size="lg">
            <FontAwesomeIcon icon='chevron-right' />
          </ActionIcon>
        </Group>

        <SegmentedControl
          value={dateFilter}
          onChange={(value) => setDateFilter(value as DateFilter)}
          data={[
            { label: t('day.today'), value: 'today' },
            { label: t('day.yesterday'), value: 'yesterday' },
            { label: t('powerLogs.customFilterTitle'), value: 'custom' },
          ]}
          fullWidth
        />

        {dateFilter === 'custom' && (
          <DateRangePicker
            clearable={false}
            placeholder={t("powerLogs.dateRangePlaceholder")}
            value={customDateRange}
            onChange={(value) => setCustomDateRange(value as DateRange)}
          />
        )}

        {loading && <Center p="xl"><Loader size="lg" /></Center>}
        {error && <Text c="red" ta="center">{t('error.generic', { error })}</Text>}

        {dateFilter === 'custom' && (!customDateRange.from || !customDateRange.to) && (
          <Text c="dimmed" ta="center" py="xl">
            {t('powerLogs.validation.dateRangeInvalid')}
          </Text>
        )}

        {!loading && !error && data && (dateFilter !== 'custom' || (customDateRange.from && customDateRange.to)) && (
          <>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>
                  {t('powerLogs.totalGridOnTitle')}:
                </Text>
                <Text c={isDark ? 'teal.4' : 'teal.7'}>
                  {totalAvailable}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>
                  {t('powerLogs.totalGridOffTitle')}:
                </Text>
                <Text c={isDark ? 'red.4' : 'red.7'}>
                  {totalUnavailable}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>
                  {t('powerLogs.totalGeneratorChargeTimeTitle')}:
                </Text>
                <Text c={isDark ? 'yellow.4' : 'yellow.7'}>
                  {totalGeneratorTime}
                </Text>
              </Group>
            </Stack>

            <Table stickyHeader stickyHeaderOffset={60} striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('powerLogs.table.startTime')}</Table.Th>
                  <Table.Th>{t('powerLogs.table.endTime')}</Table.Th>
                  <Table.Th>{t('powerLogs.table.state')}</Table.Th>
                  <Table.Th>{t('powerLogs.table.duration')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed">{t('powerLogs.noDataTitle')}</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>{t('button.close')}</Button>
        </Group>
      </Stack>
    );
  };

  const id: string | undefined = modals.open({
    title: t('powerLogs.dialogTitle'),
    centered: true,
    size: "xl",
    scrollAreaComponent: ScrollArea.Autosize,
    children: (
      <>
        <style>{ANIMATION_STYLES}</style>
        <Inner />
      </>
    ),
  });
}
