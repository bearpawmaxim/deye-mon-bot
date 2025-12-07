import { createAsyncThunk } from "@reduxjs/toolkit";
import { StationDetailsData, StationDataItem } from "../types";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { ObjectId } from "../../schemas";


export const fetchStationsData = createAsyncThunk<Array<StationDataItem>, number>('stationsSata/fetchStationsData', async (lastSeconds, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<StationDataItem>>('/stationsData/stationsData', { lastSeconds: lastSeconds });
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch stations data');
  }
});

export const fetchStationDetails = createAsyncThunk<StationDetailsData, { stationId: ObjectId, lastSeconds: number }>(
  'stationsData/fetchStationDetails',
  async ({ stationId, lastSeconds }, thunkAPI) => {
    try {
      const response = await apiClient.post<StationDetailsData>(`/stationsData/stationDetails/${stationId}`, { lastSeconds });
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch station details data');
    }
  }
);
