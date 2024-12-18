import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { ServerStationItem } from "../types";

export const fetchStations = createAsyncThunk('stations/fetchStations', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ServerStationItem>>('/stations/stations');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch channels');
  }
});
