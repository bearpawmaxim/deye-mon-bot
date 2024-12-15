import { combineReducers } from "redux";
import {  botsReducer } from "./slices";

export const rootReducer = combineReducers({
  ['bots']: botsReducer
});