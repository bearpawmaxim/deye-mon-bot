import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AuthData } from "../../types";

const selectAuth = (state: RootState) => state.auth;

export const authDataSelector = createSelector(
  [selectAuth],
  (auth) => ({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
  } as AuthData),
);