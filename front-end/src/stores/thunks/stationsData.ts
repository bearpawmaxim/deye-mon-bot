import { createAsyncThunk } from "@reduxjs/toolkit";
import { StationDataItem } from "../types";
import apiClient from "../../utils/apiClient";


export const fetchStationsData = createAsyncThunk<Array<StationDataItem>, number>('stations/fetchStations', async (lastSeconds, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<StationDataItem>>('/stationsData/stationsData', { lastSeconds: lastSeconds });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch stations data');
  }
});
