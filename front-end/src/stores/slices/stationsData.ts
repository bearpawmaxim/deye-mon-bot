import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StationDataItem, StationsDataState } from "../types";
import { fetchStationsData } from "../thunks";

const initialState: StationsDataState = {
  stationsData: [],
  error: null,
  loading: false,
};

export const stationsDataSlice = createSlice({
    name: 'stations',
    initialState: initialState,
    reducers: {
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchStationsData.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchStationsData.fulfilled, (state, action: PayloadAction<Array<StationDataItem>>) => {
          state.stationsData = action.payload.map(channel => ({ ...channel, changed: false}));
          state.loading = false;
        })
        .addCase(fetchStationsData.rejected, (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
    
  export const stationsDataReducer = stationsDataSlice.reducer;