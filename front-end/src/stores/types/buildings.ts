import { MantineColor } from "@mantine/core";
import { BaseState } from "./base";
import { BuildingEditType, ObjectId } from "../../schemas";

export type BuildingSummaryItem = {
  batteryPercent?: number;
  batteryDischargeTime?: string;
  consumptionPower: number;
  isGridAvailable: boolean;
  isDischarging: boolean;
  isCharging: boolean;
};

export type BuildingListItem = BuildingSummaryItem & {
  id?: ObjectId;
  name: string;
  color: MantineColor;
};

export type BuildingsState = BaseState & {
  items: Array<BuildingListItem>;
  edittedItems: Array<BuildingEditType & { isNew?: boolean }>;
  editingItem?: BuildingEditType;
  changed: boolean;
  globalId: number;
};
