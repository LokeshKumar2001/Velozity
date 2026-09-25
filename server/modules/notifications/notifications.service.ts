import { NotificationsRepository, notificationsRepository } from './notifications.repository.js';
import { NotificationResponse } from './notifications.types.js';

export class NotificationsService {
  constructor(private repo: NotificationsRepository = notificationsRepository) {}

  async getUserNotifications(userId: string): Promise<NotificationResponse> {
    const [notifications, unreadCount] = await Promise.all([
      this.repo.findByUserId(userId),
      this.repo.countUnread(userId),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string): Promise<{ success: boolean; unreadCount: number }> {
    await this.repo.markAsRead(id, userId);
    const unreadCount = await this.repo.countUnread(userId);

    return {
      success: true,
      unreadCount,
    };
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; unreadCount: number }> {
    await this.repo.markAllAsRead(userId);

    return {
      success: true,
      unreadCount: 0,
    };
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
