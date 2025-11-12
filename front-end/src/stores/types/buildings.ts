import { MantineColor } from "@mantine/core";
import { BaseState } from "./base";

export type BuildingListItem = {
  id?: number;
  name: string;
  color: MantineColor;
  station_name: string;
  report_user_name: string;
};

export type BuildingsState = BaseState & {
  items: Array<BuildingListItem>;
};