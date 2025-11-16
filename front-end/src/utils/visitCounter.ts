import { useAppDispatch } from "../stores/store";
import { postVisitStats } from "../stores/thunks";

export function trackVisit() {
  const dispatch = useAppDispatch();

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
}
