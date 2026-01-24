import { ObjectId } from "../../schemas";
import { BaseState } from "./base";

export type PowerLogPeriod = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  durationSeconds: number;
};

export type PowerLogsData = {
  periods: PowerLogPeriod[];
  totalAvailableSeconds: number;
  totalUnavailableSeconds: number;
  totalGeneratorSeconds: number;
  totalSeconds: number;
};

export type PowerLogsState = BaseState & {
  data: PowerLogsData | null;
  buildingId: ObjectId | null;
};

