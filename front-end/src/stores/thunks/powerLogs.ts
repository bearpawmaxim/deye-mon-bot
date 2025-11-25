import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { PowerLogsData } from "../types";

export type FetchPowerLogsParams = {
  buildingId: number;
  startDate: string;
  endDate: string;
};

export const fetchPowerLogs = createAsyncThunk(
  'powerLogs/fetchPowerLogs',
  async (params: FetchPowerLogsParams, thunkAPI) => {
    try {
      const response = await apiClient.post<PowerLogsData>(
        `/buildings/${params.buildingId}/power-logs`,
        {
          startDate: params.startDate,
          endDate: params.endDate,
        }
      );
      return {
        buildingId: params.buildingId,
        data: response.data,
      };
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch power logs');
    }
  }
);

