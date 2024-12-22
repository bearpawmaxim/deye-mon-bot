import { combineReducers } from "redux";
import { authReducer, botsReducer, messagesReducer, stationsReducer } from "./slices";

export const rootReducer = combineReducers({
  ['auth']: authReducer,
  ['bots']: botsReducer,
  ['stations']: stationsReducer,
  ['messages']: messagesReducer,
});