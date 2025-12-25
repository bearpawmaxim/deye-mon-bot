import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { DateOrDateRange, DateRange } from "../types";
import i18n from "../i18n";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const getDateObject = (date: Date | string) => 
  typeof date === "string" ? dayjs(date) : dayjs(date);

export const formatDateTime = (date: Date | string, ms: boolean = false) => {
  const dateObject = getDateObject(date);
  const formatStr = ms ? "DD.MM.YYYY HH:mm:ss.SSS" : "DD.MM.YYYY HH:mm:ss";
  return dateObject.isValid() ? dateObject.format(formatStr) : "";
};

export const formatDate = (date: Date | string) => {
  const dateObject = getDateObject(date);
  return dateObject.isValid() ? dateObject.format("DD.MM.YYYY") : "";
};

export const formatDuration = (seconds: number, roundUp = false): string => {
  const totalSeconds =
    roundUp && seconds % 60 > 0
      ? Math.ceil(seconds / 60) * 60
      : seconds;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const format = (value: number, unit: Intl.NumberFormatOptions['unit']) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
    }).format(value);

  if (hours > 0) {
    return roundUp
      ? `${format(hours, 'hour')} ${format(minutes, 'minute')}`
      : `${format(hours, 'hour')} ${format(minutes, 'minute')} ${format(secs, 'second')}`;
  }

  if (minutes > 0) {
    return roundUp
      ? format(minutes, 'minute')
      : `${format(minutes, 'minute')} ${format(secs, 'second')}`;
  }

  return format(secs, 'second');
};

export const toDateRange = (date: string | null | undefined): DateRange => {
  if (!date) {
    return { from: null, to: null };
  }

  const parts = date.split(",").map((part) => part.trim());

  if (parts.length === 1) {
    const d = dayjs(parts[0]);
    return { from: d.isValid() ? d.toDate() : null, to: d.isValid() ? d.toDate() : null };
  } else if (parts.length === 2) {
    const start = dayjs(parts[0]);
    const end = dayjs(parts[1]);
    return {
      from: start.isValid() ? start.toDate() : null,
      to: end.isValid() ? end.toDate() : null,
    };
  } else {
    return { from: null, to: null };
  }
};

export const fromDateRange = (range: DateOrDateRange): string | null => {
  let start: dayjs.Dayjs | null;
  let end: dayjs.Dayjs | null;

  if (range instanceof Date) {
    start = dayjs(range);
    end = dayjs(range);
  } else if (range.from) {
    start = dayjs(range.from);
    end = range.to ? dayjs(range.to) : dayjs(range.from);
  } else {
    return null;
  }

  if ((!start || !start.isValid()) && (!end || !end.isValid())) {
    return null;
  }

  const format = (d: dayjs.Dayjs | null) => (d && d.isValid() ? d.toISOString() : "");

  if (start && end && start.isValid() && end.isValid() && start.isSame(end)) {
    return format(start);
  }

  return `${format(start)}, ${format(end)}`;
};

export const toLocalDateTime = (date: Date | string | null | undefined, ms: boolean = false): string => {
  if (!date) return "";
  
  const dateObject = typeof date === "string" 
    ? dayjs.utc(date).local() 
    : dayjs(date);
  
  const formatStr = ms ? "DD.MM.YYYY HH:mm:ss.SSS" : "DD.MM.YYYY HH:mm:ss";
  return dateObject.isValid() ? dateObject.format(formatStr) : "";
};

export const toLocalDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObject = typeof date === "string" 
    ? dayjs.utc(date).local() 
    : dayjs(date);
  
  return dateObject.isValid() ? dateObject.format("DD.MM.YYYY") : "";
};

export const minutesToHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

export const getThisWeekDates = (): DateRange => {
  const now = dayjs();
  const startDate = now
    .startOf('day')
    .subtract((now.day() + 6) % 7, 'day')
    .toDate();
  const endDate = now
    .endOf('day')
    .toDate();
  return {
    from: startDate,
    to: endDate,
  };
};
