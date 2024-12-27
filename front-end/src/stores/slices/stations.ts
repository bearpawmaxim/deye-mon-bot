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

export type ChangeStationOrderPayload = {
  id: number;
  currentOrder: number;
  delta: number;
};

export const stationsSlice = createSlice({
  name: 'stations',
  initialState: initialState,
  reducers: {
    updateStationState(state, { payload }: PayloadAction<UpdateStationActionPayload>) {
      const station = state.stations.find(s => s.id === payload.id);
      if (!station) {
        return;
      }
      if (station.enabled !== payload.enabled) {
        station.enabled = payload.enabled;
        station.changed = true;
      }
    },
    updateStationOrder(state, { payload }: PayloadAction<ChangeStationOrderPayload>) {
      const { currentOrder, delta } = payload;
      const newOrder = currentOrder + delta;
      if (newOrder < 1 || newOrder > state.stations.length) {
        return;
      }

      const stationsCopy = [...state.stations];

      const stationA = state.stations[currentOrder - 1];
      const stationB = state.stations[newOrder - 1];

      stationsCopy[newOrder - 1] = { ...stationA, order: newOrder, changed: true };
      stationsCopy[currentOrder - 1] = { ...stationB, order: currentOrder, changed: true };

      state.stations = stationsCopy;
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
  
export const { updateStationState, updateStationOrder, stationStateSaved } = stationsSlice.actions;
export const stationsReducer = stationsSlice.reducer;