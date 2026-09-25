import { TasksRepository, tasksRepository } from './tasks.repository.js';
import { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO, TaskFilterQuery } from './tasks.types.js';
import { AppError } from '../../errors/app-error.js';
import { AuthUser } from '../../types/express.js';
import { prisma } from '../../config/database.config.js';
import { broadcastActivity, broadcastTaskUpdate, sendRealtimeNotification } from '../../infrastructure/websocket/socket.server.js';
import { TaskStatus } from '@prisma/client';

export class TasksService {
  constructor(private repo: TasksRepository = tasksRepository) {}

  async getTasks(filters: TaskFilterQuery, user: AuthUser) {
    return this.repo.findAll(filters, user.role, user.id);
  }

  async getTaskById(id: string, user: AuthUser) {
    const task = await this.repo.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    // Role-based authorization guard
    if (user.role === 'DEVELOPER' && task.assignedTo !== user.id) {
      throw AppError.forbidden('You do not have permission to view this task');
    }

    if (user.role === 'PROJECT_MANAGER' && task.project.managerId !== user.id) {
      throw AppError.forbidden('You do not have permission to view this task');
    }

    return task;
  }

  async createTask(dto: CreateTaskDTO, user: AuthUser) {
    // Only Admin and Project Manager can create tasks
    if (user.role === 'DEVELOPER') {
      throw AppError.forbidden('Developers cannot create tasks');
    }

    // Verify project exists and belongs to PM if not Admin
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === 'PROJECT_MANAGER' && project.managerId !== user.id) {
      throw AppError.forbidden('You can only create tasks in projects you manage');
    }

    // If assigned to a developer, verify developer exists
    let developer = null;
    if (dto.assignedTo) {
      developer = await prisma.user.findUnique({
        where: { id: dto.assignedTo },
      });
      if (!developer) {
        throw AppError.notFound('Assigned developer not found');
      }
    }

    const task = await this.repo.create(dto);

    // 1. Record activity log
    const activity = await prisma.activityLog.create({
      data: {
        projectId: task.projectId,
        taskId: task.id,
        userId: user.id,
        action: 'TASK_CREATED',
        oldStatus: null,
        newStatus: task.status,
        metadata: {
          taskTitle: task.title,
          assigneeName: developer?.name || null,
          message: `${user.name} created task '${task.title}' in '${project.name}'`,
        },
      },
    });

    // 2. Send notification to assigned Developer if assigned
    if (task.assignedTo) {
      const notif = await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          taskId: task.id,
          type: 'TASK_ASSIGNED',
          message: `You have been assigned to Task '${task.title}' in '${project.name}'`,
        },
      });

      sendRealtimeNotification({
        id: notif.id,
        userId: notif.userId,
        taskId: notif.taskId,
        type: notif.type,
        message: notif.message,
        isRead: false,
        createdAt: notif.createdAt.toISOString(),
      });
    }

    // 3. Broadcast real-time activity and task creation
    broadcastActivity(
      {
        id: activity.id,
        projectId: task.projectId,
        taskId: task.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: activity.action,
        newStatus: task.status,
        formattedMessage: `${user.name} created task '${task.title}' in '${project.name}'`,
        createdAt: activity.createdAt.toISOString(),
      },
      task.assignedTo
    );

    broadcastTaskUpdate(task.projectId, task, task.assignedTo);

    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDTO, user: AuthUser) {
    const task = await this.repo.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    // Role check: Only Admin or the project's PM can edit task properties
    if (user.role === 'PROJECT_MANAGER' && task.project.managerId !== user.id) {
      throw AppError.forbidden('You can only edit tasks in projects you manage');
    }

    if (user.role === 'DEVELOPER') {
      throw AppError.forbidden('Developers cannot edit task metadata; use update status endpoint');
    }

    const previousAssignee = task.assignedTo;
    const updated = await this.repo.update(id, dto);

    // If assignment changed, notify the newly assigned developer
    if (dto.assignedTo && dto.assignedTo !== previousAssignee) {
      const notif = await prisma.notification.create({
        data: {
          userId: dto.assignedTo,
          taskId: updated.id,
          type: 'TASK_ASSIGNED',
          message: `You have been assigned to Task '${updated.title}' in '${task.project.name}'`,
        },
      });

      sendRealtimeNotification({
        id: notif.id,
        userId: notif.userId,
        taskId: notif.taskId,
        type: notif.type,
        message: notif.message,
        isRead: false,
        createdAt: notif.createdAt.toISOString(),
      });
    }

    broadcastTaskUpdate(updated.projectId, updated, updated.assignedTo);
    return updated;
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDTO, user: AuthUser) {
    const task = await this.repo.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    // Role verification:
    // Developer can only update tasks assigned to them
    if (user.role === 'DEVELOPER' && task.assignedTo !== user.id) {
      throw AppError.forbidden('You can only update the status of tasks assigned to you');
    }

    // PM can only update tasks in projects they manage
    if (user.role === 'PROJECT_MANAGER' && task.project.managerId !== user.id) {
      throw AppError.forbidden('You can only update tasks in projects you manage');
    }

    const oldStatus = task.status;
    const newStatus = dto.status;

    if (oldStatus === newStatus) {
      return task;
    }

    // Update status in DB
    const updatedTask = await this.repo.updateStatus(id, newStatus);

    // Format human-readable status name (e.g. IN_PROGRESS -> In Progress)
    const formatStatus = (s: string) =>
      s
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    const formattedMessage = `${user.name} moved '${task.title}' from ${formatStatus(oldStatus)} → ${formatStatus(newStatus)}`;

    // 1. Record activity log in database (NOT derived, stored permanently)
    const activity = await prisma.activityLog.create({
      data: {
        projectId: task.projectId,
        taskId: task.id,
        userId: user.id,
        action: 'TASK_STATUS_UPDATED',
        oldStatus,
        newStatus,
        metadata: {
          taskTitle: task.title,
          oldStatusFormatted: formatStatus(oldStatus),
          newStatusFormatted: formatStatus(newStatus),
          message: formattedMessage,
        },
      },
    });

    // 2. If moved to IN_REVIEW, notify the Project Manager
    if (newStatus === TaskStatus.IN_REVIEW) {
      const pmNotif = await prisma.notification.create({
        data: {
          userId: task.project.managerId,
          taskId: task.id,
          type: 'TASK_IN_REVIEW',
          message: `Task '${task.title}' was moved to In Review by ${user.name}`,
        },
      });

      sendRealtimeNotification({
        id: pmNotif.id,
        userId: pmNotif.userId,
        taskId: pmNotif.taskId,
        type: pmNotif.type,
        message: pmNotif.message,
        isRead: false,
        createdAt: pmNotif.createdAt.toISOString(),
      });
    }

    // 3. Broadcast real-time activity event across authorized rooms
    broadcastActivity(
      {
        id: activity.id,
        projectId: task.projectId,
        taskId: task.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: activity.action,
        oldStatus,
        newStatus,
        formattedMessage,
        createdAt: activity.createdAt.toISOString(),
      },
      task.assignedTo
    );

    // 4. Broadcast live task update so all users viewing that project see the board update
    broadcastTaskUpdate(task.projectId, updatedTask, task.assignedTo);

    return updatedTask;
  }

  async deleteTask(id: string, user: AuthUser) {
    const task = await this.repo.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (user.role === 'PROJECT_MANAGER' && task.project.managerId !== user.id) {
      throw AppError.forbidden('You can only delete tasks in projects you manage');
    }

    if (user.role === 'DEVELOPER') {
      throw AppError.forbidden('Developers cannot delete tasks');
    }

    return this.repo.delete(id);
  }
}

export const tasksService = new TasksService();
export default tasksService;
