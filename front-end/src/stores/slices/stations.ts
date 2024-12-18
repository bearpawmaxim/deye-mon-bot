import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerStationItem, StationsState } from "../types";
import { fetchStations } from "../thunks";

const initialState: StationsState = {
  stations: [],
  creating: false,
  error: null,
  loading: false,
};

export const stationsSlice = createSlice({
    name: 'stations',
    initialState: initialState,
    reducers: {
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
          state.creating = false;
        })
        .addCase(fetchStations.rejected, (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export const stationsReducer = stationsSlice.reducer;