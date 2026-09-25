import { prisma } from '../../config/database.config.js';
import { Project, Prisma } from '@prisma/client';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFilterQuery } from './projects.types.js';

export class ProjectsRepository {
  async findAll(filters: ProjectFilterQuery, userRole: string, userId: string) {
    const where: Prisma.ProjectWhereInput = {};

    // 1. Enforce strict role boundary scoping
    if (userRole === 'PROJECT_MANAGER') {
      where.managerId = userId;
    } else if (userRole === 'DEVELOPER') {
      where.tasks = {
        some: { assignedTo: userId },
      };
    }

    // 2. Apply search and client filter
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.project.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          include: {
            developer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateProjectDTO & { managerId: string }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        managerId: data.managerId,
      },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateProjectDTO) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}

export const projectsRepository = new ProjectsRepository();
export default projectsRepository;
