import { FC, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../stores/store";
import { fetchVisitStats, postVisitStats } from "../../stores/thunks";
import { Badge, Box, em } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useSubscribeEvents } from "../../hooks";
import { EventItem, EventType } from "../../types";

export const VisitTracker: FC = () => {
  const dispatch = useAppDispatch();
  const visitData = useAppSelector(state => state.visitCounter.visits);
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

  const { t } = useTranslation('common');

  const fetchData = useCallback(() => {
    dispatch(fetchVisitStats())
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const GUID_KEY = "visitor_guid";
    const LAST_VISIT_DATE_KEY = "last_visit_date";

    let guid = localStorage.getItem(GUID_KEY);
    let firstVisitEver = false;

    if (!guid) {
      guid = crypto.randomUUID();
      localStorage.setItem(GUID_KEY, guid);
      firstVisitEver = true;
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastVisitDate = localStorage.getItem(LAST_VISIT_DATE_KEY);

    if (firstVisitEver) {
      dispatch(postVisitStats({ type: "total" }));
    }

    if (lastVisitDate !== today) {
      localStorage.setItem(LAST_VISIT_DATE_KEY, today);
      dispatch(postVisitStats({ type: "daily", date: today }));
    }
  }, [dispatch]);

  useSubscribeEvents((event: EventItem) => {
    if (event.type === EventType.VisitsUpdated) {
      fetchVisitStats();
    }
  });

  return (
    <Box fz='xs'>
      {t('visits.unique')}:&nbsp;
      { isMobile
          ? t('visits.dailyMobile', { dailyVisitors: visitData.dailyVisitors })
          : <Badge variant="outline" m="xs">
        <FontAwesomeIcon icon="eye" />&nbsp;
        {t('visits.daily', { dailyVisitors: visitData.dailyVisitors })}
      </Badge> }
      { isMobile
        ? t('visits.totalMobile', { totalVisitors: visitData.totalVisitors })
          : <Badge variant="outline">
        <FontAwesomeIcon icon="eye" />&nbsp;
        {t('visits.total', { totalVisitors: visitData.totalVisitors })}
      </Badge> }
    </Box>
  );
};
