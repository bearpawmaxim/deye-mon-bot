import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { ExtDataItem } from "../types";
import { getErrorMessage } from "../../utils";

export const fetchExtData = createAsyncThunk('extData/fetchExtData', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<Array<ExtDataItem>>('/ext-data/list');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch ext data');
  }
});

