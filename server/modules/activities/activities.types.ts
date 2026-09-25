export interface ActivityFilterQuery {
  projectId?: string;
  limit?: string;
  page?: string;
}

export interface FormattedActivity {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string | null;
  taskTitle?: string | null;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  formattedMessage: string;
  createdAt: Date;
}
