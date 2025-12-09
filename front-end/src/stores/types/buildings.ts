import { MantineColor } from "@mantine/core";
import { BaseState } from "./base";
import { BuildingEditType, ObjectId } from "../../schemas";

export type BuildingListItem = {
  id?: ObjectId;
  name: string;
  color: MantineColor;
  batteryPercent?: number;
  batteryDischargeTime?: string;
  consumptionPower: number;
  isGridAvailable: boolean;
  isDischarging: boolean;
  isCharging: boolean;
};

export type BuildingsState = BaseState & {
  items: Array<BuildingListItem>;
  edittedItems: Array<BuildingEditType & { isNew?: boolean }>;
  editingItem?: BuildingEditType;
  changed: boolean;
  globalId: number;
};