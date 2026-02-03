import { createListenerMiddleware } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { eventsService } from "../../services";
import { appStarted } from "../slices";

const appMiddleware = createListenerMiddleware();
const startListening = appMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startListening({
  actionCreator: appStarted,
  effect: (_action, api) => {
    const token = (api.getState() as RootState).auth.accessToken;
    eventsService.setToken(token ?? undefined);
    eventsService.reconnect(token ?? undefined);
  },
});

export default appMiddleware;