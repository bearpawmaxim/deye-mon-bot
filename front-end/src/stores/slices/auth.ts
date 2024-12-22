import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserData } from "../types";
import { fetchUserData, login, logout } from "../thunks";
import { getToken } from "../../utils/tokenStorage";

const initialState: AuthState = {
  token: getToken(),
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
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
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action: PayloadAction<{ accessToken: string, user: UserData }>) => {
        const {accessToken, user} = action.payload;
        state.token = accessToken;
        state.user = user;
        state.loading = false;
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.loading = false;
        delete state.user;
        state.token = null;
        // TODO: Error.
      });
  },
});


export const {} = authSlice.actions;
export const authReducer = authSlice.reducer;
