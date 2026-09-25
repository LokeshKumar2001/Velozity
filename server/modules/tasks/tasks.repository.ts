import { prisma } from '../../config/database.config.js';
import { Task, Prisma, TaskStatus } from '@prisma/client';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilterQuery } from './tasks.types.js';

export class TasksRepository {
  async findAll(filters: TaskFilterQuery, userRole: string, userId: string) {
    const where: Prisma.TaskWhereInput = {};

    if (userRole === 'DEVELOPER') {
      where.assignedTo = userId;
    } else if (userRole === 'PROJECT_MANAGER') {
      where.project = {
        managerId: userId,
      };
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.assignedTo && userRole !== 'DEVELOPER') {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            manager: { select: { id: true, name: true, email: true } },
          },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
        activityLogs: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateTaskDTO) {
    return prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo || null,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: new Date(data.dueDate),
        isOverdue: new Date(data.dueDate) < new Date(),
      },
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateTaskDTO) {
    const updateData: Prisma.TaskUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.assignedTo !== undefined && { developer: data.assignedTo ? { connect: { id: data.assignedTo } } : { disconnect: true } }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate && {
        dueDate: new Date(data.dueDate),
        isOverdue: new Date(data.dueDate) < new Date(),
      }),
    };

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: TaskStatus) {
    return prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}

export const tasksRepository = new TasksRepository();
export default tasksRepository;
