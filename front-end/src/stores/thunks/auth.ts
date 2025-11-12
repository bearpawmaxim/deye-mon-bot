import { createAsyncThunk } from '@reduxjs/toolkit'
import { BaseResponse, UserData } from '../types';
import { AxiosError } from 'axios';
import apiClient from '../../utils/apiClient';
import { getErrorMessage } from '../../utils';

export const fetchUser = createAsyncThunk('auth/fetchUserData', async (_, {rejectWithValue}) => {
  try {
    const response = await apiClient.get<UserData>('/auth/profile');
    return response.data;
  } catch(error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = BaseResponse & {
  access_token?: string;
  error?: string;
};

export const login = createAsyncThunk<string, LoginRequest>('auth/login', async (payload, { fulfillWithValue, rejectWithValue }) => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    const token = response.data.access_token!;
    return fulfillWithValue(token);
  } catch(error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data?.error);
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  return await apiClient.post('/auth/logout');
});
