import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BotsState, ServerBotItem } from "../types";
import { fetchBots, saveBots } from "../thunks";

const initialState: BotsState = {
  bots: [],
  loading: false,
  creating: false,
  error: null,
};

export type UpdateBotActionPayload = {
  id: number;
  enabled?: boolean;
  hookEnabled?: boolean;
  token?: string;
};

export const botsSlice = createSlice({
  name: 'bots',
  initialState: initialState,
  reducers: {
    updateBot(state, { payload }: PayloadAction<UpdateBotActionPayload>) {
      const bot = state.bots.find(b => b.id === payload.id);
      if (bot) {
        bot.enabled = payload.enabled ?? bot.enabled;
        bot.hookEnabled = payload.hookEnabled ?? bot.hookEnabled;
        bot.token = payload.token ?? bot.token;
        bot.changed = true;
      }
    },
    botSaved(state, { payload: botId }: PayloadAction<number>) {
      const bot = state.bots.find(bot => bot.id === botId);
      if (bot) {
        bot.changed = false;
      }
    },
    startCreatingBot(state) {
      state.creating = true;
    },
    cancelCreatingBot(state) {
      state.creating = false;
    },
    createBot(state, { payload: token }: PayloadAction<string>) {
      state.creating = false;
      state.bots.push({
        enabled: true,
        hookEnabled: true,
        token: token,
        changed: true
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBots.fulfilled, (state, action: PayloadAction<Array<ServerBotItem>>) => {
        state.bots = action.payload.map(bot => ({ ...bot, changed: false}));
        state.loading = false;
        state.creating = false;
      })
      .addCase(fetchBots.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(saveBots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBots.fulfilled, (state) => {
        state.loading = false;
        state.creating = false;
      })
      .addCase(saveBots.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateBot, botSaved, startCreatingBot, cancelCreatingBot, createBot } = botsSlice.actions;
export const botsReducer = botsSlice.reducer;