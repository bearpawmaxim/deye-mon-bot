import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UsersState, ServerUserItem } from "../types";
import { fetchUsers, saveUsers, generateUserToken, deleteUserToken } from "../thunks";

const initialState: UsersState = {
  users: [],
  loading: false,
  creating: false,
  error: null,
};

export type UpdateUserActionPayload = {
  id?: number;
  name?: string;
  password?: string;
  isActive?: boolean;
  isReporter?: boolean;
};

export type CreateUserPayload = {
  name: string;
  password: string;
  isReporter: boolean;
};

export const usersSlice = createSlice({
  name: 'users',
  initialState: initialState,
  reducers: {
    updateUser(state, { payload }: PayloadAction<UpdateUserActionPayload>) {
      const user = state.users.find(u => u.id === payload.id);
      if (user) {
        user.name = payload.name ?? user.name;
        user.password = payload.password ?? user.password;
        user.isActive = payload.isActive ?? user.isActive;
        user.isReporter = payload.isReporter ?? user.isReporter;
        user.changed = true;
      }
    },
    userSaved(state, { payload: userId }: PayloadAction<number>) {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.changed = false;
      }
    },
    startCreatingUser(state) {
      state.creating = true;
    },
    cancelCreatingUser(state) {
      state.creating = false;
    },
    createUser(state, { payload }: PayloadAction<CreateUserPayload>) {
      state.creating = false;
      state.users.push({
        id: -Date.now(),
        name: payload.name,
        password: payload.password,
        isActive: true,
        isReporter: payload.isReporter,
        changed: true
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<Array<ServerUserItem>>) => {
        state.users = action.payload.map(user => ({ ...user, changed: false, password: '', apiKey: user.apiKey || null }));
        state.loading = false;
        state.creating = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : action.error?.message || 'Failed to fetch users';
      });
    builder
      .addCase(saveUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUsers.fulfilled, (state) => {
        state.loading = false;
        state.creating = false;
      })
      .addCase(saveUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : action.error?.message || 'Failed to save users';
      });
    builder
      .addCase(generateUserToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateUserToken.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.token) {
          const userId = action.meta.arg; 
          const user = state.users.find(u => u.id === userId);
          if (user) {
            user.apiKey = action.payload.token;
          }
        }
      })
      .addCase(generateUserToken.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : action.error?.message || 'Failed to generate token';
      });
    builder
      .addCase(deleteUserToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserToken.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.meta.arg; 
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.apiKey = null;
        }
      })
      .addCase(deleteUserToken.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : action.error?.message || 'Failed to delete token';
      });
  },
});

export const { updateUser, userSaved, startCreatingUser, cancelCreatingUser, createUser } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;

