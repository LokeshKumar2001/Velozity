import { TaskStatus, TaskPriority } from '@prisma/client';

export interface CreateTaskDTO {
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate: string | Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assignedTo?: string | null;
  priority?: TaskPriority;
  dueDate?: string | Date;
}

export interface UpdateTaskStatusDTO {
  status: TaskStatus;
}

export interface TaskFilterQuery {
  projectId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}
