import { Middleware, ThunkDispatch, Action } from "@reduxjs/toolkit";
import { EventItem, eventsService } from "../../services";
import {
  fetchVisitStats,
  fetchStations,
  fetchBuildings,
  fetchOutagesSchedule,
  fetchMessages,
  fetchAllowedChats,
  fetchChatRequests,
  fetchDashboardConfig
} from "../thunks";

export const eventsMiddleware: Middleware<
  object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ThunkDispatch<unknown, unknown, Action>
> = store => {
  const handleEvent = (event: EventItem) => {
    const state = store.getState();
    const isAuthenticated = Boolean(state.auth?.profile);
    const userName = isAuthenticated ? state.auth?.profile?.userName : "nobody";

    if (event.user === userName) {
      return;
    }

    switch (event.type) {
      case "visits_updated":
        store.dispatch<unknown>(fetchVisitStats());
        break;

      case "dashboard_config_updated":
        store.dispatch<unknown>(fetchDashboardConfig());
        break;

      case "station_data_updated":
      case "buildings_updated":
      case "ext_data_updated":
        if (event.type === "station_data_updated" && isAuthenticated) {
          store.dispatch<unknown>(fetchStations());
        }
        store.dispatch<unknown>(fetchBuildings());
        break;

      case "outages_updated": {
        const config = state.dashboardConfig?.config;
        if (config?.enableOutagesSchedule && config?.outagesScheduleQueue) {
          store.dispatch<unknown>(fetchOutagesSchedule(config.outagesScheduleQueue));
        }
        break;
      }

      case "messages_updated":
        store.dispatch<unknown>(fetchMessages());
        break;

      case "chats_updated":
        store.dispatch<unknown>(fetchAllowedChats());
        store.dispatch<unknown>(fetchChatRequests());
        break;
      
      case "ping":
        break;

      default:
        console.warn("Unhandled SSE event:", event.type);
    }
  };

  eventsService.subscribe(handleEvent);

  const token = store.getState()?.auth?.accessToken;
  if (token) {
    eventsService.connect(token);
  } else {
    eventsService.connect();
  }

  return next => action => next(action);
};
