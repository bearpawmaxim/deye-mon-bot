import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BuildingsSummaryState, BuildingSummaryItem } from "../types";
import { fetchBuildingsSummary } from "../thunks";

const initialState: BuildingsSummaryState = {
  items: [],
  loading: false,
  error: null,
};

export const buildingsSummarySlice = createSlice({
  name: 'buildingsSummary',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildingsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingsSummary.fulfilled, (state, action: PayloadAction<Array<BuildingSummaryItem>>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchBuildingsSummary.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const buildingsSummaryReducer = buildingsSummarySlice.reducer;