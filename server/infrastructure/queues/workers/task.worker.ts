import { prisma } from '../../../config/database.config.js';
import { broadcastActivity, sendRealtimeNotification, broadcastTaskUpdate } from '../../websocket/socket.server.js';

export const processOverdueTasks = async (): Promise<number> => {
  try {
    const now = new Date();

    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'DONE' },
        isOverdue: false,
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

    if (overdueTasks.length === 0) {
      return 0;
    }

    console.log(`[scheduler] Found ${overdueTasks.length} overdue tasks to update`);

    for (const task of overdueTasks) {
      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { isOverdue: true },
      });

      const activity = await prisma.activityLog.create({
        data: {
          projectId: task.projectId,
          taskId: task.id,
          userId: task.project.managerId,
          action: 'TASK_FLAGGED_OVERDUE',
          oldStatus: task.status,
          newStatus: task.status,
          metadata: {
            taskTitle: task.title,
            dueDate: task.dueDate.toISOString(),
            message: `Task '${task.title}' has crossed its due date and is flagged as Overdue`,
          },
        },
      });

      if (task.assignedTo) {
        const notif = await prisma.notification.create({
          data: {
            userId: task.assignedTo,
            taskId: task.id,
            type: 'TASK_OVERDUE',
            message: `Task '${task.title}' in project '${task.project.name}' is overdue!`,
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

      const pmNotif = await prisma.notification.create({
        data: {
          userId: task.project.managerId,
          taskId: task.id,
          type: 'TASK_OVERDUE',
          message: `Task '${task.title}' in your project '${task.project.name}' is overdue.`,
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

      broadcastActivity(
        {
          id: activity.id,
          projectId: activity.projectId,
          taskId: activity.taskId,
          userId: activity.userId,
          userName: 'System Scheduler',
          userRole: 'SYSTEM',
          action: activity.action,
          oldStatus: activity.oldStatus,
          newStatus: activity.newStatus,
          formattedMessage: `Task '${task.title}' was automatically flagged as Overdue`,
          createdAt: activity.createdAt.toISOString(),
        },
        task.assignedTo
      );

      broadcastTaskUpdate(task.projectId, updatedTask, task.assignedTo);
    }

    return overdueTasks.length;
  } catch (error) {
    console.error('Failed to process overdue tasks:', error);
    return 0;
  }
};
