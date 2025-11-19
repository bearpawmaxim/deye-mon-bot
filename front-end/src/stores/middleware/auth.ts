import { createListenerMiddleware, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { removeToken, setAuthorizationHeader, setToken } from "../../utils";
import { login, logout } from "../thunks";
import { resetAuthData } from "../slices";

const authMiddleware = createListenerMiddleware();
const startListening = authMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startListening({
  actionCreator: login.fulfilled,
  effect: (action: PayloadAction<string>) => {
    const token = action.payload;
    setToken(token);
    setAuthorizationHeader(token);
  },
});

startListening({
  actionCreator: logout.fulfilled,
  effect: async () => {
    removeToken();
    setAuthorizationHeader(null);
  },
});

startListening({
  actionCreator: resetAuthData,
  effect: async () => {
    removeToken();
    setAuthorizationHeader(null);
  },
});
export default authMiddleware;
