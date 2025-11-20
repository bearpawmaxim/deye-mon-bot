import { createAsyncThunk } from "@reduxjs/toolkit";
import { StationDataItem } from "../types";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";


export const fetchStationsData = createAsyncThunk<Array<StationDataItem>, number>('stationsSata/fetchStationsData', async (lastSeconds, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<StationDataItem>>('/stationsData/stationsData', { lastSeconds: lastSeconds });
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch stations data');
  }
});
