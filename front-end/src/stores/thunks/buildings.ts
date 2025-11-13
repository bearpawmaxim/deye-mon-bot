import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { BuildingListItem } from "../types";

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<BuildingListItem>>('/buildings/buildings');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch buildings');
  }
});
