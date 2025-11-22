import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { OutagesScheduleData } from "../types";

export const fetchOutagesSchedule = createAsyncThunk<OutagesScheduleData, string>(
  'outagesSchedule/fetchOutagesSchedule',
  async (queue, thunkAPI) => {
    try {
      const response = await apiClient.get(`/outagesSchedule/outagesSchedule/${queue}`);
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch visit stats');
    }
  }
);