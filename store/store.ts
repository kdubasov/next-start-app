import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import generalApi from 'api/apiList/general';

import layout from './slices/layout';

const rootReducer = combineReducers({
  //slices
  layout: layout,
  //queries
  [generalApi.reducerPath]: generalApi.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(generalApi.middleware),
});

setupListeners(store.dispatch);

export default store;

export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<TAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<TRootState> = useSelector;
