import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PowerLogsData, PowerLogsState } from "../types";
import { fetchPowerLogs } from "../thunks";

const initialState: PowerLogsState = {
  data: null,
  buildingId: null,
  loading: false,
  error: null,
};

export const powerLogsSlice = createSlice({
  name: 'powerLogs',
  initialState,
  reducers: {
    clearPowerLogs(state) {
      state.data = null;
      state.buildingId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPowerLogs.fulfilled, (state, action: PayloadAction<{ buildingId: number; data: PowerLogsData }>) => {
        state.data = action.payload.data;
        state.buildingId = action.payload.buildingId;
        state.loading = false;
      })
      .addCase(fetchPowerLogs.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPowerLogs } = powerLogsSlice.actions;
export const powerLogsReducer = powerLogsSlice.reducer;
export default powerLogsSlice.reducer;

