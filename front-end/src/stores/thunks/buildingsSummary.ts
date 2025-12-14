import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { BuildingSummaryItem } from "../types";
import { ObjectId } from "../../schemas";

export const fetchBuildingsSummary = createAsyncThunk(
  'buildingsSummary/fetchBuildingsSummary',
  async (buildingIds: Array<ObjectId>, thunkAPI) => {
    try {
      const uri = '/dashboard/buildings/summary/' + buildingIds.join(',');
      const response = await apiClient.get<Array<BuildingSummaryItem>>(uri);
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch buildings');
    }
  });
