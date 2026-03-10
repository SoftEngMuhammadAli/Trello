import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { clearAccessToken, getAccessToken, setAccessToken } from '../../utils/authStorage';
import { connectSocket, disconnectSocket } from '../../app/socket';
import { ensureUserProfile } from './profileDefaults';

export const registerUser = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, thunkAPI) => {
  try {
    const token = getAccessToken();
    if (token) {
      const { data } = await api.get('/users/profile');
      return { accessToken: token, user: data.user };
    }

    const { data } = await api.post('/auth/refresh');
    return data;
  } catch (_error) {
    return thunkAPI.rejectWithValue('Not authenticated');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Request failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const fetchCurrentUserProfile = createAsyncThunk('auth/fetchCurrentUserProfile', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/users/profile');
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load profile');
  }
});

export const updateCurrentUserProfile = createAsyncThunk(
  'auth/updateCurrentUserProfile',
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.put('/users/update', payload);
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  },
);

const initialState = {
  user: null,
  accessToken: getAccessToken(),
  status: 'idle',
  profileStatus: 'idle',
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = ensureUserProfile(action.payload.user);
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
        connectSocket(action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = ensureUserProfile(action.payload.user);
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
        connectSocket(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        state.user = ensureUserProfile(action.payload.user);
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
        connectSocket(action.payload.accessToken);
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'idle';
        state.initialized = true;
        state.user = null;
        state.accessToken = null;
        clearAccessToken();
        disconnectSocket();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
        clearAccessToken();
        disconnectSocket();
      })
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.user = ensureUserProfile(action.payload);
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCurrentUserProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(updateCurrentUserProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.user = ensureUserProfile(action.payload);
      })
      .addCase(updateCurrentUserProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
