import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import workspaceReducer from '../features/workspaces/workspaceSlice';
import boardReducer from '../features/boards/boardSlice';
import uiReducer from '../features/cards/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspaceReducer,
    boards: boardReducer,
    ui: uiReducer,
  },
});


