import { BaseState } from "./base";

export enum SlotType {
  Definite = "Definite",
  NotPlanned = "NotPlanned",
};

export type TimeSlot = {
  start: number;
  end: number;
  type: SlotType;
};

export enum DayDataStatus {
  ScheduleApplies = "ScheduleApplies",
  EmergencyShutdowns = "EmergencyShutdowns",
  WaitingForSchedule = "WaitingForSchedule",
};

export type DayData = {
  slots: TimeSlot[];
  date?: string;
  status?: DayDataStatus;
};

export type OutagesScheduleData = {
  days?: DayData[];
  updatedOn?: string;
};

export type OutagesScheduleState = BaseState & {
  outagesSchedule: OutagesScheduleData;
};
