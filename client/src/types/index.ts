export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    managerId?: string;
  };
  developer?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  action: string;
  oldStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  metadata?: any;
  createdAt: string;
  project?: { id: string; name: string };
  task?: { id: string; title: string };
  user?: { id: string; name: string; role: UserRole };
  userName?: string;
  userRole?: string;
  formattedMessage?: string;
}

export interface Notification {
  id: string;
  userId: string;
  taskId?: string | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  connectedAt: string;
}

export interface DashboardMetrics {
  role: UserRole;
  totalProjects?: number;
  totalTasks?: number;
  overdueTasks?: number;
  activeUsersOnline?: number;
  onlineUsers?: OnlineUser[];
  tasksByStatus?: Record<TaskStatus, number>;
  tasksByPriority?: Record<TaskPriority, number>;
  recentActivities?: ActivityLog[];
  upcomingThisWeekCount?: number;
  projectsSummary?: Array<{
    id: string;
    name: string;
    clientName: string;
    taskCount: number;
  }>;
  assignedCount?: number;
  inProgressCount?: number;
  overdueCount?: number;
  tasks?: Task[];
}
