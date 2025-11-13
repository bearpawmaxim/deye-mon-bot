import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseServerUserItem, BaseSaveDataResponse, ServerUserItem, GenerateTokenResponse } from "../types";
import { userSaved } from "../slices";
import { RootState } from "../store";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";


export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
    try {
      const response = await apiClient.post<Array<ServerUserItem>>('/users/users');
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch users');
    }
  });

export const saveUsers = createAsyncThunk('users/saveUsers', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as RootState;
    const usersState = state.users;
    const promises = usersState.users.filter(u => u.changed).map(async user => {
      const serverDto = {
        id: user.id,
        name: user.name,
        password: user.password,
        isActive: user.isActive,
        isReporter: user.isReporter,
      } as BaseServerUserItem;
      const response = await apiClient.put<BaseSaveDataResponse>('/users/save', serverDto);
      dispatch(userSaved(response.data.id));
    });
    await Promise.all(promises);
    dispatch(fetchUsers());
  } catch (error: unknown) {
    console.error(error);
  }
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId: number, { dispatch }) => {
  try {
    await apiClient.delete(`/users/delete/${userId}`);
    dispatch(fetchUsers());
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
});

export const cancelUsersEditing = createAsyncThunk('users/cancelEditing', async (_, { dispatch }) => {
  dispatch(fetchUsers());
});

export const generateUserToken = createAsyncThunk<GenerateTokenResponse, number>(
  'users/generateToken', 
  async (userId, thunkAPI) => {
    try {
      const response = await apiClient.post<GenerateTokenResponse>(`/users/generate-token/${userId}`);
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to generate token');
    }
  }
);

export const deleteUserToken = createAsyncThunk<void, number>(
  'users/deleteToken',
  async (userId, thunkAPI) => {
    try {
      await apiClient.delete(`/users/delete-token/${userId}`);
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to delete token');
    }
  }
);

