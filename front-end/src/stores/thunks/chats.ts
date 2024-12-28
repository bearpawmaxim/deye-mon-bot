import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { AllowedChatListItem, ChatRequestListItem } from "../types";

export const fetchAllowedChats = createAsyncThunk('chats/fetchAllowedChats', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<AllowedChatListItem>>('/chats/allowedChats');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch allowed chats');
  }
});

export const fetchChatRequests = createAsyncThunk('chats/fetchChatRequests', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ChatRequestListItem>>('/chats/chatRequests');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch chat requests');
  }
});

export const approveChatRequest = createAsyncThunk('chats/approve', async (id: number, { rejectWithValue, dispatch }) => {
  try {
    await apiClient.patch('/chats/approve', { id: id });
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch chat requests');
  } finally {
    dispatch(fetchAllowedChats());
    dispatch(fetchChatRequests());
  }
});

export const rejectChatRequest = createAsyncThunk('chats/reject', async (id: number, { rejectWithValue, dispatch }) => {
  try {
    await apiClient.patch('/chats/reject', { id: id });
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch chat requests');
  } finally {
    dispatch(fetchChatRequests());
  }
});