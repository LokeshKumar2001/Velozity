import { prisma } from '../../config/database.config.js';

export class NotificationsRepository {
  async findByUserId(userId: string, limit: number = 30) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        task: {
          select: { id: true, title: true, projectId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
export default notificationsRepository;
