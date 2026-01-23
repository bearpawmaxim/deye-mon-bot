import { ObjectId } from "../../schemas";
import { BaseState } from "./base";

export enum ChargeSource {
  NONE = "None",
  GRID = "Grid",
  GENERATOR = "Generator",
  SOLAR = "Solar"
};

export type BuildingSummaryItem = {
  id: ObjectId;
  batteryPercent?: number;
  batteryChargeTime?: string;
  batteryDischargeTime?: string;
  consumptionPower: number;
  isGridAvailable: boolean;
  gridAvailabilityPct?: number;
  hasMixedReporterStates?: boolean;
  isDischarging: boolean;
  isCharging: boolean;
  isOffline: boolean;
  chargeSource: ChargeSource;
};

export type BuildingsSummaryState = BaseState & {
  items: Array<BuildingSummaryItem>;
};
