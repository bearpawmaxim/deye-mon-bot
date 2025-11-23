import { Action, combineReducers } from "redux";
import { authReducer, botsReducer, chatsReducer, messagesReducer, stationsReducer, stationsDataReducer, buildingsReducer, usersReducer, extDataReducer, dashboardConfigReducer, visitCounterReducer, outagesScheduleReducer } from "./slices";
import { logout } from "./thunks";

const appReducer = combineReducers({
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

type RootState = ReturnType<typeof appReducer>;

export const rootReducer = (state: RootState | undefined, action: Action) => {
  if (action.type === logout.fulfilled.type) {
    state = undefined;
  }
  return appReducer(state, action);
};
