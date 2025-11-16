import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../stores/store";
import { fetchVisitStats, postVisitStats } from "../../stores/thunks";
import { Badge, Box } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const VisitTracker: FC = () => {
  const dispatch = useAppDispatch();
  const visitData = useAppSelector(state => state.visitCounter.visits);

  useEffect(() => {
    dispatch(fetchVisitStats())
  }, [dispatch]);

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

  return (
    <Box fz='xs'>
      visits:
      <Badge variant="outline" m="xs">
        <FontAwesomeIcon icon="eye" />&nbsp;
        Daily: {visitData.dailyVisitors}
      </Badge>
      <Badge variant="outline">
        <FontAwesomeIcon icon="eye" />&nbsp;
        Total: {visitData.totalVisitors}
      </Badge>
    </Box>
  );
};
