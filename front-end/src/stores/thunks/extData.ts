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

export const createExtData = createAsyncThunk(
  'extData/createExtData', 
  async (data: { user_id: number; grid_state: boolean; received_at?: string }, thunkAPI) => {
    try {
      const response = await apiClient.post<{ status: string; id: number }>('/ext-data/create', data);
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to create ext data');
    }
  }
);

export const deleteExtData = createAsyncThunk(
  'extData/deleteExtData',
  async (id: number, thunkAPI) => {
    try {
      await apiClient.delete(`/ext-data/delete/${id}`);
      return id;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to delete ext data');
    }
  }
);

