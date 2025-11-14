import { combineReducers } from "redux";
import { authReducer, botsReducer, chatsReducer, messagesReducer, stationsReducer, stationsDataReducer, buildingsReducer, usersReducer, extDataReducer, dashboardConfigReducer } from "./slices";

export const rootReducer = combineReducers({
  ['auth']: authReducer,
  ['bots']: botsReducer,
  ['buildings']: buildingsReducer,
  ['extData']: extDataReducer,
  ['chats']: chatsReducer,
  ['dashboardConfig']: dashboardConfigReducer,
  ['stations']: stationsReducer,
  ['stationsData']: stationsDataReducer,
  ['messages']: messagesReducer,
  ['users']: usersReducer,
});