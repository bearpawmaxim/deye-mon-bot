import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { BaseServerBotItem, BaseSaveDataResponse, ServerBotItem } from "../types";
import { botSaved } from "../slices";
import { RootState } from "../store";


export const fetchBots = createAsyncThunk('bots/fetchBots', async (_, thunkAPI) => {
    try {
      const response = await apiClient.post<Array<ServerBotItem>>('/bots/bots');
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch bots');
    }
  });

export const saveBots = createAsyncThunk('bots/saveBot', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as RootState;
    const botsState = state.bots;
    const promises = botsState.bots.filter(b => b.changed).map(async bot => {
      const serverDto = {
        id: bot.id,
        token: bot.token,
        enabled: bot.enabled,
      } as BaseServerBotItem;
      const response = await apiClient.put<BaseSaveDataResponse>('/bots/save', serverDto);
      dispatch(botSaved(response.data.id));
    });
    await Promise.all(promises);
    dispatch(fetchBots());
  } catch (error: any) {
    console.error(error);
  }
});

export const cancelBotsEditing = createAsyncThunk('bots/cancelEditing', async (_, { dispatch }) => {
  dispatch(fetchBots());
});