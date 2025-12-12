import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { AllowedChatListItem, ChatRequestListItem } from "../types";
import { getErrorMessage } from "../../utils";
import { ObjectId } from "../../schemas";

export const fetchAllowedChats = createAsyncThunk('chats/fetchAllowedChats', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<AllowedChatListItem>>('/chats/allowedChats');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch allowed chats');
  }
});

export const fetchChatRequests = createAsyncThunk('chats/fetchChatRequests', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ChatRequestListItem>>('/chats/chatRequests');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch chat requests');
  }
});

export const approveChatRequest = createAsyncThunk('chats/approve', async (id: ObjectId, { rejectWithValue, dispatch }) => {
  try {
    await apiClient.patch('/chats/approve', { id: id });
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error) || 'Failed to approve chat request');
  } finally {
    dispatch(fetchAllowedChats());
    dispatch(fetchChatRequests());
  }
});

export const rejectChatRequest = createAsyncThunk('chats/reject', async (id: ObjectId, { rejectWithValue, dispatch }) => {
  try {
    await apiClient.patch('/chats/reject', { id: id });
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error) || 'Failed to reject chat request');
  } finally {
    dispatch(fetchChatRequests());
  }
});

export const disallowChat = createAsyncThunk('chats/disallow', async (id: ObjectId, { rejectWithValue, dispatch }) => {
  try {
    await apiClient.patch('/chats/disallow', { id: id });
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error) || 'Failed to disallow chat');
  } finally {
    dispatch(fetchAllowedChats());
    dispatch(fetchChatRequests());
  }
});