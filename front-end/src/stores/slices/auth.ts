import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, ProfileData, UpdateAuthDataPayload } from "../types";
import { fetchProfile, login, LoginResponse } from "../thunks";
import { getAccessToken, getRefreshToken } from "../../utils/tokenStorage";
import { ProfileEdit } from "../../schemas";

const initialState: AuthState = {
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthData: (state, { payload }: PayloadAction<UpdateAuthDataPayload>) => {
      state.accessToken = payload.authData.accessToken;
      state.refreshToken = payload.authData.refreshToken;
    },
    resetAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
    startEditingProfile: (state) => {
      state.editingProfile = {
        userId: state.profile!.userId,
        userName: state.profile!.userName,
      };
    },
    editProfile: (state, { payload }: PayloadAction<ProfileEdit>) => {
      state.profile = payload;
    },
    finishEditingProfile: (state) => {
      delete state.editingProfile;
    },
    logout: (state) => {
      delete state.profile;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, { payload }: PayloadAction<LoginResponse>) => {
        state.accessToken = payload!.accessToken;
        state.refreshToken = payload!.refreshToken;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
        delete state.profile;
        state.accessToken = null;
      });
  },
});


export const {
  editProfile,
  updateAuthData,
  resetAuthData,
  startEditingProfile,
  finishEditingProfile,
  logout,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
