import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, ProfileData } from "../types";
import { fetchProfile, login, logout } from "../thunks";
import { getToken } from "../../utils/tokenStorage";
import { ProfileEdit } from "../../schemas";

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        delete state.profile;
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
        state.token = null;
      });
    // builder
    //   .addCase(saveProfile.pending, (state) => {
    //     state.loading = true;
    //   })
    //   .addCase(saveProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
    //     state.profile = action.payload;
    //     state.loading = false;
    //   })
    //   .addCase(saveProfile.rejected, (state) => {
    //     state.loading = false;
    //     delete state.profile;
    //     state.token = null;
    //   });
  },
});


export const {
  editProfile,
  updateAuthData,
  resetAuthData,
  startEditingProfile,
  finishEditingProfile,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
