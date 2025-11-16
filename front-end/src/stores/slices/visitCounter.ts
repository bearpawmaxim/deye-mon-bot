import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VisitCounterState, VisitRecord } from "../types";
import { fetchVisitStats } from "../thunks/visitCounter";

const initialState: VisitCounterState = {
  loading: false,
  error: null,
  visits: {}
};

export const visitCounterSlice = createSlice({
  name: 'visitCounter',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitStats.fulfilled, (state, action: PayloadAction<VisitRecord>) => {
        state.visits = action.payload;
        state.loading = false;
      })
      .addCase(fetchVisitStats.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const visitCounterReducer = visitCounterSlice.reducer;
