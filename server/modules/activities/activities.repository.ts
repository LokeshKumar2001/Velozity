import { prisma } from '../../config/database.config.js';
import { Prisma } from '@prisma/client';
import { ActivityFilterQuery } from './activities.types.js';

export class ActivitiesRepository {
  async findFeed(filters: ActivityFilterQuery, userRole: string, userId: string) {
    const where: Prisma.ActivityLogWhereInput = {};
    const limit = filters.limit ? Math.min(parseInt(filters.limit, 10), 100) : 20;

    // 1. Role-based scoping
    if (userRole === 'ADMIN') {
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
    } else if (userRole === 'PROJECT_MANAGER') {
      where.project = {
        managerId: userId,
      };
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
    } else if (userRole === 'DEVELOPER') {
      // Developer sees activity only on tasks assigned to them
      where.task = {
        assignedTo: userId,
      };
    }

    return prisma.activityLog.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true },
        },
        task: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const activitiesRepository = new ActivitiesRepository();
export default activitiesRepository;
