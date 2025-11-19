import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessagesState, ServerMessageListItem, TemplatePreviewResponse } from "../types";
import { editMessage, fetchMessages, getChannel, getTemplatePreview, saveMessage } from "../thunks";
import { MessageType } from "../../schemas";


const initialState: MessagesState = {
  messages: [],
  creating: false,
  error: null,
  loading: false,
  changed: false,
  loadingPreview: false,
};

export type UpdateMessageActionPayload = {
  id: number;
  enabled: boolean;
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState: initialState,
    reducers: {
      updateMessageState(state, { payload }: PayloadAction<UpdateMessageActionPayload>) {
        const message = state.messages.find(s => s.id === payload.id);
        if (!message) {
          return;
        }
        if (message.enabled !== payload.enabled) {
          message.enabled = payload.enabled;
          message.changed = true;
        }
      },
      messageStateSaved(state, { payload: stationId }: PayloadAction<number>) {
        const station = state.messages.find(s => s.id === stationId);
        if (station) {
          station.changed = false;
        }
      },
      updateMessage(state, { payload }: PayloadAction<MessageType>) {
        state.editingMessage = payload;
        state.changed = true;
      },
      createMessage(state) {
        const messageNumber = state.messages?.length ?? 0;
        state.editingMessage = {
          name: `New message ${messageNumber + 1}`,
          enabled: false,
        } as MessageType;
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
        .addCase(fetchMessages.rejected, (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        });
      builder
        .addCase(editMessage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(editMessage.fulfilled, (state, action: PayloadAction<MessageType>) => {
          state.loading = false;
          state.creating = false;
          state.changed = false;
          state.editingMessage = action.payload;
        })
        .addCase(editMessage.rejected, (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        });
      builder
        .addCase(getChannel.pending, (state) => {
          state.editingMessage!.channelName = 'Loading...';
        })
        .addCase(getChannel.fulfilled, (state, action: PayloadAction<string>) => {
          state.editingMessage!.channelName = action.payload;
        })
        .addCase(getChannel.rejected, (state, action: PayloadAction<unknown>) => {
          state.error = action.payload as string;
          state.editingMessage!.channelName = null;
        });
      builder
        .addCase(getTemplatePreview.pending, (state) => {
          state.loadingPreview = true;
          delete state.templatePreview;
          delete state.previewError;
        })
        .addCase(getTemplatePreview.fulfilled, (state, { payload: preview }: PayloadAction<TemplatePreviewResponse>) => {
          state.loadingPreview = false;
          state.templatePreview = {
            message: preview.message,
            nextSendTime: preview.nextSendTime,
            shouldSend: preview.shouldSend,
            timeout: preview.timeout,
          };
        })
        .addCase(getTemplatePreview.rejected, (state, action: PayloadAction<unknown>) => {
          state.loadingPreview = false;
          state.previewError = action.payload as string;
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
        .addCase(saveMessage.rejected, (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    },
  });
  
  export const {
    updateMessage,
    createMessage,
    finishEditingMessage,
    updateMessageState,
    messageStateSaved,
  } = messagesSlice.actions;
  export const messagesReducer = messagesSlice.reducer;