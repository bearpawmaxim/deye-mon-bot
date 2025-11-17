import { DashboardEditType } from "../../schemas/dashboardEdit";
import { BaseState } from "./base";

export type DashboardConfig = {
  title: string;
  enableOutagesSchedule: boolean;
  outagesScheduleQueue: string;
};

export type DashboardConfigState = BaseState & {
  config?: DashboardConfig;
  editingConfig?: DashboardEditType;
  changed: boolean;
};