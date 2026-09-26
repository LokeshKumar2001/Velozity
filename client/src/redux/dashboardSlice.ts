import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DashboardMetrics, OnlineUser } from '../types/index.ts';
import { dashboardApi } from '../api/client.ts';

interface DashboardState {
  metrics: DashboardMetrics | null;
  onlineCount: number;
  onlineUsers: OnlineUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  onlineCount: 0,
  onlineUsers: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.getMetrics();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch metrics');
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setPresenceCount: (state, action: PayloadAction<number>) => {
      state.onlineCount = action.payload;
    },
    setPresenceUpdate: (state, action: PayloadAction<{ count: number; onlineUsers: OnlineUser[] }>) => {
      state.onlineCount = action.payload.count;
      state.onlineUsers = action.payload.onlineUsers;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
        if (action.payload.activeUsersOnline !== undefined) {
          state.onlineCount = action.payload.activeUsersOnline;
        }
        if (action.payload.onlineUsers) {
          state.onlineUsers = action.payload.onlineUsers;
        }
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPresenceCount, setPresenceUpdate } = dashboardSlice.actions;
export default dashboardSlice.reducer;
