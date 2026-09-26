import axios from 'axios';
import type { User, Project, Task, ActivityLog, Notification, DashboardMetrics } from '../types/index.ts';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenGetter: (() => string | null) | null = null;
let tokenSetter: ((token: string | null) => void) | null = null;

export const setAuthTokenHandlers = (
  get: () => string | null,
  set: (token: string | null) => void
) => {
  tokenGetter = get;
  tokenSetter = set;
};

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = response.data?.data?.accessToken;

        if (newToken) {
          tokenSetter?.(newToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenSetter?.(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', credentials);
    return res.data.data;
  },
  loginWithGoogle: async (credential: string) => {
    const res = await apiClient.post<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/google', { credential });
    return res.data.data;
  },
  refresh: async () => {
    const res = await apiClient.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh');
    return res.data.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },
};

export const projectsApi = {
  getAll: async (params?: { clientId?: string; search?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: Project[] }>('/projects', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return res.data.data;
  },
  create: async (data: { name: string; description?: string; clientId: string; managerId?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: Project }>('/projects', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Project>) => {
    const res = await apiClient.patch<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export const tasksApi = {
  getAll: async (params?: {
    projectId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: Task[] }>('/tasks', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return res.data.data;
  },
  create: async (data: {
    projectId: string;
    title: string;
    description?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    dueDate: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>('/tasks', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Task>) => {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const activityApi = {
  getFeed: async (params?: { projectId?: string; limit?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: ActivityLog[] }>('/activity/feed', { params });
    return res.data.data;
  },
};

export const notificationsApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: { notifications: Notification[]; unreadCount: number } }>('/notifications');
    return res.data.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; unreadCount: number }>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.patch<{ success: boolean; unreadCount: number }>('/notifications/read-all');
    return res.data;
  },
};

export const dashboardApi = {
  getMetrics: async () => {
    const res = await apiClient.get<{ success: boolean; data: DashboardMetrics }>('/dashboard/metrics');
    return res.data.data;
  },
};

export const usersApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return res.data.data;
  },
  create: async (data: { name: string; email: string; password?: string; role: string }) => {
    const res = await apiClient.post<{ success: boolean; data: User }>('/users', data);
    return res.data.data;
  },
};

export const clientsApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/clients');
    return res.data.data;
  },
  create: async (data: { name: string; email: string }) => {
    const res = await apiClient.post<{ success: boolean; data: any }>('/clients', data);
    return res.data.data;
  },
};
