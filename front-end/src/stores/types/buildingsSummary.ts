import { ObjectId } from "../../schemas";
import { BaseState } from "./base";

export type BuildingSummaryItem = {
  id: ObjectId;
  batteryPercent?: number;
  batteryDischargeTime?: string;
  consumptionPower: number;
  isGridAvailable: boolean;
  gridAvailabilityPct?: number;
  hasMixedReporterStates?: boolean;
  isDischarging: boolean;
  isCharging: boolean;
  isOffline: boolean;
};

export type BuildingsSummaryState = BaseState & {
  items: Array<BuildingSummaryItem>;
};
