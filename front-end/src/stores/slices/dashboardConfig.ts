import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardConfig, DashboardConfigState } from "../types";
import { KeyValuePair } from "../../types";
import { fetchDashboardConfig } from "../thunks/dashboardConfig";
import { parseBoolean } from "../../utils";

const initialState: DashboardConfigState = {
  loading: false,
  error: null,
};

const processDashboardConfig = (configs: Array<KeyValuePair>): DashboardConfig => {
  return {
    title: configs.find(f => f.key === 'title')?.value ?? '',
    enableOutagesSchedule:
      parseBoolean(configs.find(f => f.key === 'enableOutagesSchedule')?.value ?? 'false') ?? false,
    outagesScheduleQueue: configs.find(f => f.key === 'outagesScheduleQueue')?.value ?? '',
  };
}

export const dashboardConfigSlice = createSlice({
  name: 'dashboardConfig',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardConfig.fulfilled, (state, action: PayloadAction<Array<KeyValuePair>>) => {
        state.config = processDashboardConfig(action.payload);
        state.loading = false;
      })
      .addCase(fetchDashboardConfig.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const dashboardConfigReducer = dashboardConfigSlice.reducer;