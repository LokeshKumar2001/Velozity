import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../types/index.ts';
import { tasksApi } from '../api/client.ts';

interface TasksState {
  items: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (
    params: { projectId?: string; assignedTo?: string; status?: string; priority?: string; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await tasksApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch tasks');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await tasksApi.updateStatus(id, status);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update status');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    data: { projectId: string; title: string; description?: string; assignedTo?: string; status?: string; priority?: string; dueDate: string },
    { rejectWithValue }
  ) => {
    try {
      return await tasksApi.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to create task');
    }
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    upsertTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      } else {
        state.items.unshift(action.payload);
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { upsertTask, removeTask } = tasksSlice.actions;
export default tasksSlice.reducer;
