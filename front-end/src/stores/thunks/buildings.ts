import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";
import { BuildingListItem } from "../types";
import { BuildingEditType, ObjectId } from "../../schemas";
import { RootState } from "../store";

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<Array<BuildingListItem>>('/dashboard/buildings');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch buildings');
  }
});

export const startEditingBuilding = createAsyncThunk('buildings/startEditingBuilding', async (buildingId: ObjectId, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const building = state.buildings.edittedItems.find(b => b.id === buildingId);
    if (building) {
      return building;
    }
    const response = await apiClient.get<BuildingEditType>(`/dashboard/buildings/${buildingId}`);
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
        name: building.name,
        color: building.color,
        stationId: building.stationId,
        reportUserId: building.reportUserId,
      } as BuildingEditType;
      if (building.isNew) {
        await apiClient.post('/dashboard/buildings', serverDto);
      } else {
        await apiClient.put(`/dashboard/buildings/${building.id}`, serverDto);
      }
    });
    await Promise.all(promises);
    dispatch(fetchBuildings());
  } catch (error: unknown) {
    console.error(error);
  }  
});

export const deleteBuilding = createAsyncThunk('buildings/deleteBuilding', async (buildingId: ObjectId, { getState }) => {
  try {
    const state = getState() as RootState;
    const building = state.buildings.edittedItems.find(f => f.id === buildingId);
    if (building?.isNew) {
      return buildingId;
    }
    await apiClient.delete(`/dashboard/buildings/${buildingId}`);
    return buildingId;
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
});
