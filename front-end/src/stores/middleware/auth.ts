import { createListenerMiddleware, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { removeTokens, setAuthorizationHeader, setTokens } from "../../utils";
import { login, logout } from "../thunks";
import { resetAuthData } from "../slices";
import { AuthData } from "../../types";
import { eventsService } from "../../services";

const authMiddleware = createListenerMiddleware();
const startListening = authMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startListening({
  actionCreator: login.fulfilled,
  effect: ({ payload }: PayloadAction<AuthData>) => {
    setTokens(payload.accessToken!, payload.refreshToken!);
    setAuthorizationHeader(payload.accessToken);
    eventsService.disconnect();
    eventsService.connect(payload.accessToken!);
  },
});

startListening({
  actionCreator: logout.fulfilled,
  effect: async () => {
    removeTokens();
    setAuthorizationHeader(null);
    eventsService.disconnect();
    eventsService.connect();
  },
});

startListening({
  actionCreator: resetAuthData,
  effect: async () => {
    removeTokens();
    setAuthorizationHeader(null);
  },
});

export default authMiddleware;
