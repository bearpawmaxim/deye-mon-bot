import { createAsyncThunk } from "@reduxjs/toolkit";
import { KeyValuePair } from "../../types";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";

export const fetchDashboardConfig = createAsyncThunk('dashboardConfig/fetchDashboardConfig', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<KeyValuePair>>('/buildings/dashboardConfig');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch dashboard config');
  }
});