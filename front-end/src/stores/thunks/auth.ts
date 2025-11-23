import { createAsyncThunk } from '@reduxjs/toolkit'
import { BaseResponse, ProfileData } from '../types';
import { AxiosError } from 'axios';
import apiClient from '../../utils/apiClient';
import { getErrorMessage } from '../../utils';
import { RootState } from '../store';

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, {rejectWithValue}) => {
  try {
    const response = await apiClient.get<ProfileData>('/auth/profile');
    return response.data;
  } catch(error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const saveProfile = createAsyncThunk(
  'auth/saveProfile',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const profile = state.auth.profile;
      await apiClient.post('/auth/saveProfile', profile);
      dispatch(logout());
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Failed to save profile');
    }
  });

export const requestPasswordReset = createAsyncThunk<string, string>(
  'auth/startPasswordReset',
  async (userName: string, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/startPasswordChange', { userName });
      const token = response.data.resetToken;
      return fulfillWithValue(token);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to request password reset'));
    }
  });

export const cancelPasswordReset = createAsyncThunk<void, string>(
  'auth/cancelPasswordReset',
  async (userName: string, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/cancelPasswordChange', { userName });
      const token = response.data.resetToken;
      return fulfillWithValue(token);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to request password reset'));
    }
  });

export type ChangePasswordRequest = {
  resetToken: string;
  newPassword: string;
};

export const changePassword = createAsyncThunk<void, ChangePasswordRequest>(
  'auth/changePassword',
  async (request: ChangePasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.post('/auth/changePassword', request);
      dispatch(logout());
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Failed change password');
    }
  });

export type LoginRequest = {
  userName: string;
  password: string;
};

export type LoginResponse = BaseResponse & {
  access_token?: string;
  error?: string;
};

export const login = createAsyncThunk<string, LoginRequest>(
  'auth/login',
  async (request, { fulfillWithValue, rejectWithValue }) => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', request);
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
