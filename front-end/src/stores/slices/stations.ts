import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerStationItem, StationsState } from "../types";
import { fetchStations, saveStationStates } from "../thunks";

const initialState: StationsState = {
  stations: [],
  error: null,
  loading: false,
};

export type UpdateStationActionPayload = {
  id: number;
  enabled: boolean;
};

export const stationsSlice = createSlice({
  name: 'stations',
  initialState: initialState,
  reducers: {
    updateStationState(state, { payload }: PayloadAction<UpdateStationActionPayload>) {
          const station = state.stations.find(s => s.id === payload.id);
          if (station) {
            station.enabled = payload.enabled;
            station.changed = true;
          }
        },
    stationStateSaved(state, { payload: stationId }: PayloadAction<number>) {
      const station = state.stations.find(s => s.id === stationId);
      if (station) {
        station.changed = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action: PayloadAction<Array<ServerStationItem>>) => {
        state.stations = action.payload.map(channel => ({ ...channel, changed: false}));
        state.loading = false;
      })
      .addCase(fetchStations.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(saveStationStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveStationStates.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveStationStates.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
  
export const { updateStationState, stationStateSaved } = stationsSlice.actions;
export const stationsReducer = stationsSlice.reducer;