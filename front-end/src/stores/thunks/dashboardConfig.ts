import { createAsyncThunk } from "@reduxjs/toolkit";
import { KeyValuePair } from "../../types";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { DashboardConfig } from "../types";
import { RootState } from "../store";

export const fetchDashboardConfig = createAsyncThunk('dashboardConfig/fetchDashboardConfig', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<Array<KeyValuePair>>('/buildings/dashboardConfig');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch dashboard config');
  }
});

export const saveDashboardConfig = createAsyncThunk('dashboardConfig/updateDashboardConfig', async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const config = state.dashboardConfig.config as DashboardConfig;
    const data = Object.entries(config).map(([key, value]) => ({ key, value }));
    const response = await apiClient.post<Array<KeyValuePair>>('/buildings/updateDashboardConfig', data);
    thunkAPI.dispatch(fetchDashboardConfig());
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to update dashboard config');
  }
});