import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchWorkspaces = createAsyncThunk(
  'workspaces/fetchAll',
  async ({ page = 1, limit = 12 } = {}, thunkAPI) => {
    try {
      const { data } = await api.get('/workspaces', { params: { page, limit } });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load workspaces');
    }
  },
);

export const createWorkspace = createAsyncThunk('workspaces/create', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/workspaces', payload);
    return data.workspace;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create workspace');
  }
});

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    meta: null,
    activeWorkspaceId:
      typeof window !== 'undefined'
        ? window.localStorage.getItem('trello_clone_active_workspace') || ''
        : '',
  },
  reducers: {
    setActiveWorkspace(state, action) {
      state.activeWorkspaceId = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('trello_clone_active_workspace', action.payload || '');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const isFirstPage = action.payload.meta?.page === 1;
        state.items = isFirstPage ? action.payload.data : [...state.items, ...action.payload.data];
        state.meta = action.payload.meta;
        if (!state.activeWorkspaceId && action.payload.data?.length > 0) {
          state.activeWorkspaceId = action.payload.data[0]._id;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('trello_clone_active_workspace', state.activeWorkspaceId);
          }
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (!state.activeWorkspaceId) {
          state.activeWorkspaceId = action.payload._id;
        }
      });
  },
});

export const { setActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
