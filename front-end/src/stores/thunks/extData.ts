import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { ExtDataItem } from "../types";
import { getErrorMessage } from "../../utils";
import { ObjectId } from "../../schemas";
import { FilterableRequest, PageableRequest, PageableResponse, SortableRequest } from "../../types";

export type ExtDataRequest = PageableRequest & SortableRequest & FilterableRequest;
type ExtDataResponse = PageableResponse<ExtDataItem>;

export const fetchExtData = createAsyncThunk(
  'extData/fetchExtData',
  async (request: ExtDataRequest, thunkAPI) => {
  try {
    const response = await apiClient.post<ExtDataResponse>('/ext-data/list', request);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch ext data');
  }
});

export const createExtData = createAsyncThunk(
  'extData/createExtData', 
  async (data: { user_id: ObjectId; grid_state: boolean; received_at?: string }, thunkAPI) => {
    try {
      const response = await apiClient.post<{ status: string; id: ObjectId }>('/ext-data/create', data);
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to create ext data');
    }
  }
);

export const deleteExtData = createAsyncThunk(
  'extData/deleteExtData',
  async (id: ObjectId, thunkAPI) => {
    try {
      await apiClient.delete(`/ext-data/delete/${id}`);
      return id;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to delete ext data');
    }
  }
);

