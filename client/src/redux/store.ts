import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer, { setAccessToken } from './authSlice.ts';
import dashboardReducer from './dashboardSlice.ts';
import projectsReducer from './projectsSlice.ts';
import tasksReducer from './tasksSlice.ts';
import activityReducer from './activitySlice.ts';
import notificationsReducer from './notificationsSlice.ts';
import { setAuthTokenHandlers } from '../api/client.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    activity: activityReducer,
    notifications: notificationsReducer,
  },
});

setAuthTokenHandlers(
  () => store.getState().auth.accessToken,
  (token) => store.dispatch(setAccessToken(token))
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
