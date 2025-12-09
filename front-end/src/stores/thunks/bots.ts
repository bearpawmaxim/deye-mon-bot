import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseServerBotItem, BaseSaveDataResponse, ServerBotItem } from "../types";
import { botSaved } from "../slices";
import { RootState } from "../store";
import apiClient from "../../utils/apiClient";
import { getErrorMessage } from "../../utils";


export const fetchBots = createAsyncThunk('bots/fetchBots', async (_, thunkAPI) => {
    try {
      const response = await apiClient.get<Array<ServerBotItem>>('/bots');
      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error) || 'Failed to fetch bots');
    }
  });

export const saveBots = createAsyncThunk('bots/updateBot', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as RootState;
    const botsState = state.bots;
    const promises = botsState.bots.filter(b => b.changed).map(async bot => {
      if (bot.created) {
        const serverDto = {
          token: bot.token,
          enabled: bot.enabled,
          hookEnabled: bot.hookEnabled,
        } as BaseServerBotItem;
        const response = await apiClient.post<BaseSaveDataResponse>('/bots', serverDto);
        dispatch(botSaved(response.data.id));
        return;
      }
      const serverDto = {
        enabled: bot.enabled,
        hookEnabled: bot.hookEnabled,
      } as BaseServerBotItem;
      const response = await apiClient.put<BaseSaveDataResponse>(`/bots/${bot.id}`, serverDto);
      dispatch(botSaved(response.data.id));
    });
    await Promise.all(promises);
    dispatch(fetchBots());
  } catch (error: unknown) {
    console.error(error);
  }
});

export const cancelBotsEditing = createAsyncThunk('bots/cancelEditing', async (_, { dispatch }) => {
  dispatch(fetchBots());
});