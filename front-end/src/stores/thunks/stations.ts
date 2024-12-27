import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseSaveDataResponse, BaseServerStationItem, ServerStationItem } from "../types";
import { RootState } from "../store";
import { stationStateSaved } from "../slices";
import apiClient from "../../utils/apiClient";


export const fetchStations = createAsyncThunk('stations/fetchStations', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ServerStationItem>>('/stations/stations');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch channels');
  }
});

export const saveStationStates = createAsyncThunk('stations/saveStationState', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as RootState;
    const stationsState = state.stations;
    const promises = stationsState.stations.filter(s => s.changed).map(async station => {
      const serverDto = {
        id: station.id,
        enabled: station.enabled,
        order: station.order,
      } as BaseServerStationItem;
      const response = await apiClient.put<BaseSaveDataResponse>('/stations/save', serverDto);
      dispatch(stationStateSaved(response.data.id));
    });
    await Promise.all(promises);
    dispatch(fetchStations());
  } catch (error: any) {
    console.error(error);
  }
});

export const cancelStationsEditing = createAsyncThunk('stations/cancelEditing', async (_, { dispatch }) => {
  dispatch(fetchStations());
});
