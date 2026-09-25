export interface NotificationResponse {
  notifications: Array<{
    id: string;
    userId: string;
    taskId?: string | null;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    task?: {
      id: string;
      title: string;
      projectId: string;
    } | null;
  }>;
  unreadCount: number;
}
