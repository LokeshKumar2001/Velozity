import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.config.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { presenceManager } from '../infrastructure/websocket/presence.manager.js';

const router = Router();
router.use(authenticateToken);

router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const now = new Date();
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (user.role === 'ADMIN') {
      const [totalProjects, totalTasks, overdueTasks, tasks, recentActivities] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({
          where: {
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: 'DONE' } },
            ],
          },
        }),
        prisma.task.findMany({
          select: { status: true, priority: true },
        }),
        prisma.activityLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, role: true } },
            project: { select: { id: true, name: true } },
            task: { select: { id: true, title: true } },
          },
        }),
      ]);

      const tasksByStatus = {
        TODO: tasks.filter((t) => t.status === 'TODO').length,
        IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
        DONE: tasks.filter((t) => t.status === 'DONE').length,
      };

      const tasksByPriority = {
        LOW: tasks.filter((t) => t.priority === 'LOW').length,
        MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
        HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
        CRITICAL: tasks.filter((t) => t.priority === 'CRITICAL').length,
      };

      res.status(200).json({
        success: true,
        data: {
          role: 'ADMIN',
          totalProjects,
          totalTasks,
          overdueTasks,
          activeUsersOnline: presenceManager.getOnlineCount(),
          onlineUsers: presenceManager.getOnlineUsers(),
          tasksByStatus,
          tasksByPriority,
          recentActivities,
        },
      });
      return;
    }

    if (user.role === 'PROJECT_MANAGER') {
      const projects = await prisma.project.findMany({
        where: { managerId: user.id },
        include: {
          tasks: {
            select: { id: true, status: true, priority: true, dueDate: true, isOverdue: true },
          },
          client: { select: { id: true, name: true } },
        },
      });

      const allPmTasks = projects.flatMap((p) => p.tasks);
      const overdueCount = allPmTasks.filter(
        (t) => t.isOverdue || (t.dueDate < now && t.status !== 'DONE')
      ).length;

      const upcomingThisWeek = allPmTasks.filter(
        (t) => t.dueDate >= now && t.dueDate <= oneWeekFromNow && t.status !== 'DONE'
      );

      const tasksByPriority = {
        LOW: allPmTasks.filter((t) => t.priority === 'LOW').length,
        MEDIUM: allPmTasks.filter((t) => t.priority === 'MEDIUM').length,
        HIGH: allPmTasks.filter((t) => t.priority === 'HIGH').length,
        CRITICAL: allPmTasks.filter((t) => t.priority === 'CRITICAL').length,
      };

      const tasksByStatus = {
        TODO: allPmTasks.filter((t) => t.status === 'TODO').length,
        IN_PROGRESS: allPmTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        IN_REVIEW: allPmTasks.filter((t) => t.status === 'IN_REVIEW').length,
        DONE: allPmTasks.filter((t) => t.status === 'DONE').length,
      };

      res.status(200).json({
        success: true,
        data: {
          role: 'PROJECT_MANAGER',
          totalProjects: projects.length,
          totalTasks: allPmTasks.length,
          overdueTasks: overdueCount,
          upcomingThisWeekCount: upcomingThisWeek.length,
          tasksByStatus,
          tasksByPriority,
          projectsSummary: projects.map((p) => ({
            id: p.id,
            name: p.name,
            clientName: p.client.name,
            taskCount: p.tasks.length,
          })),
        },
      });
      return;
    }

    // DEVELOPER Dashboard
    const assignedTasks = await prisma.task.findMany({
      where: { assignedTo: user.id },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    const inProgressCount = assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdueCount = assignedTasks.filter(
      (t) => t.isOverdue || (t.dueDate < now && t.status !== 'DONE')
    ).length;

    res.status(200).json({
      success: true,
      data: {
        role: 'DEVELOPER',
        assignedCount: assignedTasks.length,
        inProgressCount,
        overdueCount,
        tasks: assignedTasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
