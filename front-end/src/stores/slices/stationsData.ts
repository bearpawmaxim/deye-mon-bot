import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StationDetailsData, StationDataItem, StationsDataState } from "../types";
import { fetchStationDetails, fetchStationsData } from "../thunks";

const initialState: StationsDataState = {
  stationsData: [],
  stationDetails: null,
  detailsLoading: false,
  detailsError: null,
  error: null,
  loading: false,
};

export const stationsDataSlice = createSlice({
    name: 'stationData',
    initialState: initialState,
    reducers: {
      clearStationDetails: (state) => {
        state.stationDetails = null;
        state.detailsError = null;
      }
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
        .addCase(fetchStationsData.rejected, (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        .addCase(fetchStationDetails.pending, (state) => {
          state.detailsLoading = true;
          state.detailsError = null;
        })
        .addCase(fetchStationDetails.fulfilled, (state, action: PayloadAction<StationDetailsData>) => {
          state.stationDetails = action.payload;
          state.detailsLoading = false;
        })
        .addCase(fetchStationDetails.rejected, (state, action: PayloadAction<unknown>) => {
          state.detailsLoading = false;
          state.detailsError = action.payload as string;
        });
    },
  });
    
  export const { clearStationDetails } = stationsDataSlice.actions;
  export const stationsDataReducer = stationsDataSlice.reducer;