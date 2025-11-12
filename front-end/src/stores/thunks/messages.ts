import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseSaveDataResponse, ServerMessageListItem, 
  TemplatePreviewRequest, TemplatePreviewResponse } from "../types";
import { RootState } from "../store";
import apiClient from "../../utils/apiClient";
import { MessageType } from "../../schemas";
import { getErrorMessage } from "../../utils";

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post<Array<ServerMessageListItem>>('/messages/messages');
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch messages');
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
  } catch (error: unknown) {
    return Promise.reject(getErrorMessage(error) || 'Failed to fetch messages');
  }
});

export const editMessage = createAsyncThunk<MessageType, number>('messages/editMessage',
    async (message_id: number): Promise<MessageType> => {
  try {
    const response = await apiClient.post<MessageType>(`/messages/message/${message_id}`);
    return response.data;
  } catch (error: unknown) {
    return Promise.reject(getErrorMessage(error) || 'Failed to fetch messages');
  }
});

type TemplatePreviewArgs = {
  stationId: number | null;
  shouldSendTemplate: string;
  timeoutTemplate: string;
  messageTemplate: string;
};

export const getTemplatePreview = createAsyncThunk<TemplatePreviewResponse, TemplatePreviewArgs>(
    'messages/templatePreview', async (args, { getState, rejectWithValue, fulfillWithValue }) => {
  try {
    const state = getState() as RootState;
    const message = state.messages.editingMessage;
    if (!message) {
      return rejectWithValue('No message is currently editing');
    }
    const request = {
      botId: message.botId,
      channelId: message.channelId,
      messageTemplate: args.messageTemplate,
      shouldSendTemplate: args.shouldSendTemplate,
      timeoutTemplate: args.timeoutTemplate,
      stationId: args.stationId,
    } as TemplatePreviewRequest;
    const response = await apiClient.post<TemplatePreviewResponse>('/messages/getPreview', request);
    if (response.data.success) {
      return fulfillWithValue(response.data);
    } else {
      return rejectWithValue(response.data.error);
    }
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error) || 'Failed to generate template preview');
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
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error) || 'Failed to save message');
  }
});