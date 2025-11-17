import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { BuildingListItem } from "../types";
import { BuildingEditType } from "../../schemas";
import { RootState } from "../store";

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<Array<BuildingListItem>>('/buildings/buildings');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch buildings');
  }
});

export const startEditingBuilding = createAsyncThunk('buildings/startEditingBuilding', async (buildingId: number, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const building = state.buildings.edittedItems.find(b => b.id === buildingId);
    if (building) {
      return building;
    }
    const response = await apiClient.get<BuildingEditType>(`/buildings/building/${buildingId}`);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch building edit data');
  }
});

export const saveBuildings = createAsyncThunk('buildings/saveBuildings', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as RootState;
    const buildingsState = state.buildings;
    const promises = buildingsState.edittedItems.map(async building => {
      const serverDto = {
        id: building.isNew ? null : building.id,
        name: building.name,
        color: building.color,
        stationId: building.stationId,
        reportUserId: building.reportUserId,
      } as BuildingEditType;
      await apiClient.put('/buildings/save', serverDto);
    });
    await Promise.all(promises);
    dispatch(fetchBuildings());
  } catch (error: unknown) {
    console.error(error);
  }  
});

export const deleteBuilding = createAsyncThunk('buildings/deleteBuilding', async (buildingId: number, { getState }) => {
  try {
    const state = getState() as RootState;
    const building = state.buildings.edittedItems.find(f => f.id === buildingId);
    if (building?.isNew) {
      return buildingId;
    }
    await apiClient.delete(`/buildings/delete/${buildingId}`);
    return buildingId;
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
});
