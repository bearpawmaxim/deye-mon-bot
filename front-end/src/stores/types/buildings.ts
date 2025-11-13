import { MantineColor } from "@mantine/core";
import { BaseState } from "./base";

export type BuildingListItem = {
  id?: number;
  name: string;
  color: MantineColor;
  batteryPercent?: number;
  batteryDischargeTime?: string;
  consumptionPower: number;
  isGridAvailable: boolean;
};

export type BuildingsState = BaseState & {
  items: Array<BuildingListItem>;
};