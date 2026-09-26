import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Project } from '../types/index.ts';
import { projectsApi } from '../api/client.ts';

interface ProjectsState {
  items: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { clientId?: string; search?: string } | undefined, { rejectWithValue }) => {
    try {
      return await projectsApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectsApi.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (data: { name: string; description?: string; clientId: string; managerId?: string }, { rejectWithValue }) => {
    try {
      return await projectsApi.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to create project');
    }
  }
);

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by id
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
