import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { VisitRecord } from "../types";

export const fetchVisitStats = createAsyncThunk<VisitRecord, void>(
  'visitCounter/fetchVisitStats',
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get('/visit/stats');
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch visit stats');
    }
  }
);

export const postVisitStats = createAsyncThunk<void, { type: 'total' | 'daily'; date?: string }>(
  'visitCounter/postVisit',
  async (args, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post('/visit/add', null, { params: { type: args.type, date: args.date } });
      dispatch(fetchVisitStats());
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Failed to post visit');
    }
  }
);
