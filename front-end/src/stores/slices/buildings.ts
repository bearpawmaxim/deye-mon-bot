import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BuildingListItem, BuildingsState } from "../types";
import { fetchBuildings } from "../thunks";

const initialState: BuildingsState = {
  items: [],
  loading: false,
  error: null,
};

export const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action: PayloadAction<Array<BuildingListItem>>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchBuildings.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const buildingsReducer = buildingsSlice.reducer;