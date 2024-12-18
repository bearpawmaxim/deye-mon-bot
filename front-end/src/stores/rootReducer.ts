import { combineReducers } from "redux";
import { botsReducer, messagesReducer, stationsReducer } from "./slices";

export const rootReducer = combineReducers({
  ['bots']: botsReducer,
  ['stations']: stationsReducer,
  ['messages']: messagesReducer,
});