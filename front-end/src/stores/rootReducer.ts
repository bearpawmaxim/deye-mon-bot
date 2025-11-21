import { combineReducers } from "redux";
import { authReducer, botsReducer, chatsReducer, messagesReducer, stationsReducer, stationsDataReducer, buildingsReducer, usersReducer, extDataReducer, dashboardConfigReducer, visitCounterReducer, outagesScheduleReducer } from "./slices";

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
  ['outagesSchedule']: outagesScheduleReducer,
  ['users']: usersReducer,
  ['visitCounter']: visitCounterReducer,
});