import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserData } from "../types";
import { fetchUser, login, logout } from "../thunks";
import { getToken } from "../../utils/tokenStorage";

const initialState: AuthState = {
  token: getToken(),
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthData: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    resetAuthData: (state) => {
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        delete state.user;
        state.token = null;
      });
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, { payload }: PayloadAction<string>) => {
        state.token = payload!;
        state.loading = false;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        delete state.user;
        state.token = null;
      });
  },
});


export const { updateAuthData, resetAuthData } = authSlice.actions;
export const authReducer = authSlice.reducer;
