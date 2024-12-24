import { combineReducers } from "redux";
import { authReducer, botsReducer, chatsReducer, messagesReducer, stationsReducer } from "./slices";

export const rootReducer = combineReducers({
  ['auth']: authReducer,
  ['chats']: chatsReducer,
  ['bots']: botsReducer,
  ['stations']: stationsReducer,
  ['messages']: messagesReducer,
});