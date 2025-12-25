import { LocalizableValue } from "../../schemas";
import { DashboardEditType } from "../../schemas/dashboardEdit";
import { BaseState } from "./base";

export type DashboardConfig = {
  title: LocalizableValue;
  enableOutagesSchedule: boolean;
  outagesScheduleQueue: string;
};

export type DashboardConfigState = BaseState & {
  config?: DashboardConfig;
  editingConfig?: DashboardEditType;
  changed: boolean;
};