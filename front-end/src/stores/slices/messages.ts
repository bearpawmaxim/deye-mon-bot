import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessagesState, ServerMessageItem, ServerMessageListItem } from "../types";
import { editMessage, fetchMessages, getChannel, saveMessage } from "../thunks";


const initialState: MessagesState = {
  messages: [],
  creating: false,
  error: null,
  loading: false,
  changed: false,
  templatePreview: {
    messagePreview: '',
    shouldSendPreview: '',
    timeoutPreview: '',
  },
};

export type UpdateMessageActionPayload = {
  id: number;
  enabled?: boolean;
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState: initialState,
    reducers: {
      updateMessage(state, { payload }: PayloadAction<{ name: string, value: unknown }>) {
        state.editingMessage = { ...state.editingMessage, [payload.name]: payload.value } as ServerMessageItem;
        state.changed = true;
      },
      finishEditingMessage(state) {
        delete state.editingMessage;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchMessages.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Array<ServerMessageListItem>>) => {
          state.messages = action.payload;
          state.loading = false;
          state.creating = false;
        })
        .addCase(fetchMessages.rejected, (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        });
      builder
        .addCase(editMessage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(editMessage.fulfilled, (state, action: PayloadAction<ServerMessageItem>) => {
          state.loading = false;
          state.creating = false;
          state.changed = false;
          state.editingMessage = action.payload;
        })
        .addCase(editMessage.rejected, (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        });
      builder
        .addCase(getChannel.pending, (state) => {
          state.editingMessage!.channelName = 'Loading...';
        })
        .addCase(getChannel.fulfilled, (state, action: PayloadAction<string>) => {
          state.editingMessage!.channelName = action.payload;
        })
        .addCase(getChannel.rejected, (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          state.editingMessage!.channelName = action.payload;
        });
      builder
        .addCase(saveMessage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(saveMessage.fulfilled, (state) => {
          state.loading = false;
          state.creating = false;
          state.changed = false;
        })
        .addCase(saveMessage.rejected, (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export const { updateMessage, finishEditingMessage } = messagesSlice.actions;
  export const messagesReducer = messagesSlice.reducer;