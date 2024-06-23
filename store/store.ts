import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import generalApi from 'api/apiList/general';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import layout from './slices/layout';

const rootReducer = combineReducers({
  //slices
  layout: layout,
  //queries
  [generalApi.reducerPath]: generalApi.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(generalApi.middleware),
});

setupListeners(store.dispatch);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
