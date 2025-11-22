import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OutagesScheduleData, OutagesScheduleState } from "../types";
import { fetchOutagesSchedule } from "../thunks";

const initialState: OutagesScheduleState = {
  loading: false,
  error: null,
  outagesSchedule: {},
};

export const outagesScheduleSlice = createSlice({
  name: 'outagesSchedule',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutagesSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutagesSchedule.fulfilled, (state, { payload }: PayloadAction<OutagesScheduleData>) => {
        state.outagesSchedule = payload;
        state.loading = false;
      })
      .addCase(fetchOutagesSchedule.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const outagesScheduleReducer = outagesScheduleSlice.reducer;
