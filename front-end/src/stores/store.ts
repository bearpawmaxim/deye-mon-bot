// import logger from 'redux-logger';
import { rootReducer } from './rootReducer';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authMiddleware from './middleware/auth';

export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(authMiddleware.middleware);
  },
});

export type StoreType = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
