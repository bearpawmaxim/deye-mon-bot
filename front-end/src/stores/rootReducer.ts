import { combineReducers } from "redux";
import { authReducer, botsReducer, chatsReducer, messagesReducer, stationsReducer, stationsDataReducer, buildingsReducer, usersReducer, extDataReducer } from "./slices";

export const rootReducer = combineReducers({
  ['auth']: authReducer,
  ['chats']: chatsReducer,
  ['bots']: botsReducer,
  ['buildings']: buildingsReducer,
  ['extData']: extDataReducer,
  ['stations']: stationsReducer,
  ['stationsData']: stationsDataReducer,
  ['messages']: messagesReducer,
  ['users']: usersReducer,
});