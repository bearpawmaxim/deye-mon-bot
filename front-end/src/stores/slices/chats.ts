import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AllowedChatListItem, ChatRequestListItem, ChatsState } from "../types";
import { approveChatRequest, fetchAllowedChats, fetchChatRequests } from "../thunks";

const initialState: ChatsState = {
  allowedChats: [],
  chatRequests: [],
  loading: false,
  error: null,
};

export const chatsSlice = createSlice({
  name: 'chats',
  initialState: initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllowedChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllowedChats.fulfilled, (state, action: PayloadAction<Array<AllowedChatListItem>>) => {
        state.allowedChats = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllowedChats.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchChatRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRequests.fulfilled, (state, action: PayloadAction<Array<ChatRequestListItem>>) => {
        state.chatRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRequests.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(approveChatRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveChatRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveChatRequest.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const chatsReducer = chatsSlice.reducer;