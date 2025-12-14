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
  fetchDashboardConfig,
  fetchExtData,
  fetchBuildingsSummary
} from "../thunks";
import { BuildingListItem } from "../types";

export const eventsMiddleware: Middleware<
  object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ThunkDispatch<unknown, unknown, Action>
> = store => {
  const handleEvent = (event: EventItem) => {
    const state = store.getState();
    const isAuthenticated = Boolean(state.auth?.profile);
    const userName = isAuthenticated && event.private ? state.auth?.profile?.userName : "nobody";

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
        {
          if (isAuthenticated) {
            store.dispatch<unknown>(fetchStations());
          }
          const buildingIds = (state.buildings.items ?? []).map((m: BuildingListItem) => m.id);
          store.dispatch<unknown>(fetchBuildingsSummary(buildingIds));
        }
        break;

      case "buildings_updated":
        store.dispatch<unknown>(fetchBuildings());
        break;

      case "ext_data_updated":
        {
          if (isAuthenticated) {
            store.dispatch<unknown>(fetchExtData());
          }
          const buildingIds = (state.buildings.items ?? []).map((m: BuildingListItem) => m.id);
          store.dispatch<unknown>(fetchBuildingsSummary(buildingIds));
        }
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
