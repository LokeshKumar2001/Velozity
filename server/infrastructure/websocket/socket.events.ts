export enum SocketEvent {
  PRESENCE_UPDATE = 'presence:update',
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',

  ACTIVITY_NEW = 'activity:new',
  TASK_UPDATED = 'task:updated',
  TASK_CREATED = 'task:created',

  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
}

export interface ActivityPayload {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  formattedMessage: string;
  metadata?: any;
  createdAt: string;
}

export interface TaskUpdatedPayload {
  task: any;
  actorId: string;
  actorName: string;
  oldStatus: string;
  newStatus: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  taskId?: string | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
