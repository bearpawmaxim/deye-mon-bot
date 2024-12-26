import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseSaveDataResponse, ServerMessageItem, ServerMessageListItem, 
  TemplatePreviewRequest, TemplatePreviewResponse } from "../types";
import { RootState } from "../store";
import apiClient from "../../utils/apiClient";

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ServerMessageListItem>>('/messages/messages');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch messages');
  }
});

export const getChannel = createAsyncThunk<string, void>('messages/getChannel', async (_, { getState }) => {
  try {
    const state = getState() as RootState;
    const editingMessage = state.messages.editingMessage!;
    const data = {
      channelId: editingMessage.channelId,
      botId: editingMessage.botId,
    };
    const response = await apiClient.post('/messages/getChannel', data);
    return response.data['channelName'];
  } catch (error: any) {
    return Promise.reject(error.message || 'Failed to fetch messages');
  }
});

export const editMessage = createAsyncThunk<ServerMessageItem, number>('messages/editMessage',
    async (message_id: number): Promise<ServerMessageItem> => {
  try {
    const response = await apiClient.post<ServerMessageItem>(`/messages/message/${message_id}`);
    return response.data;
  } catch (error: any) {
    return Promise.reject(error.message || 'Failed to fetch messages');
  }
});

export const getTemplatePreview = createAsyncThunk<TemplatePreviewResponse, void>(
    'messages/templatePreview', async (_, { getState, rejectWithValue, fulfillWithValue }) => {
  try {
    const state = getState() as RootState;
    const message = state.messages.editingMessage;
    if (!message) {
      return rejectWithValue('No message is currently editing');
    }
    const request = {
      botId: message.botId,
      channelId: message.channelId,
      messageTemplate: message.messageTemplate,
      shouldSendTemplate: message.shouldSendTemplate,
      timeoutTemplate: message.timeoutTemplate,
      stationId: message.stationId
    } as TemplatePreviewRequest;
    const response = await apiClient.post<TemplatePreviewResponse>('/messages/getPreview', request);
    if (response.data.success) {
      return fulfillWithValue(response.data);
    } else {
      return rejectWithValue(response.data.error);
    }
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to generate template preview');
  }
});

export const saveMessage = createAsyncThunk('messages/saveMessage', async (_,
    { getState, fulfillWithValue, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const data = {
      ...state.messages.editingMessage
    };
    const response = await apiClient.patch<BaseSaveDataResponse>('/messages/save', data);
    dispatch(fetchMessages());
    return fulfillWithValue(response.data.id);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to save message');
  }
});