import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

const selectMessages = (state: RootState) => state.messages.messages;

export const selectMessagesChanged = createSelector(
  [selectMessages],
  (messages) => messages.some(s => s.changed),
);
