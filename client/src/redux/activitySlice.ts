import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ActivityLog } from '../types/index.ts';
import { activityApi } from '../api/client.ts';

interface ActivityState {
  items: ActivityLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchActivityFeed = createAsyncThunk(
  'activity/fetchFeed',
  async (params: { projectId?: string; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      return await activityApi.getFeed(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch activity feed');
    }
  }
);

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<ActivityLog>) => {
      // Check if already exists by id
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (state.items.length > 50) {
          state.items.pop();
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchActivityFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addActivity } = activitySlice.actions;
export default activitySlice.reducer;
