import { createAsyncThunk } from '@reduxjs/toolkit'
import { getToken, removeToken, setToken } from '../../utils';
import { BaseResponse } from '../types';
import { AxiosError } from 'axios';
import apiClient from '../../utils/apiClient';

export const fetchUserData = createAsyncThunk('auth/fetchUserData', async (_, {rejectWithValue}) => {
  try {
    const accessToken = getToken();
    apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
    const response = await apiClient.get('/auth/profile');
    return { ...response.data, accessToken };
  } catch(e) {
    removeToken();
    return rejectWithValue('');
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
    setToken(token!);
    return fulfillWithValue(token);
  } catch(error: any) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data?.error);
    }
    return rejectWithValue(error.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  removeToken();
});
