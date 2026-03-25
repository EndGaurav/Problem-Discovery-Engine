import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import discoveryReducer from './slices/discoverySlice';
import projectReducer from './slices/projectSlice';
import deepDiveReducer from './slices/deepDiveSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discovery: discoveryReducer,
    projects: projectReducer,
    deepDive: deepDiveReducer,
  },
});
