import { ActivitiesRepository, activitiesRepository } from './activities.repository.js';
import { ActivityFilterQuery, FormattedActivity } from './activities.types.js';
import { AuthUser } from '../../types/express.js';

export class ActivitiesService {
  constructor(private repo: ActivitiesRepository = activitiesRepository) {}

  async getFeed(filters: ActivityFilterQuery, user: AuthUser): Promise<FormattedActivity[]> {
    const logs = await this.repo.findFeed(filters, user.role, user.id);

    return logs.map((log) => {
      const metadata = log.metadata as any;
      let message = metadata?.message;

      if (!message) {
        if (log.action === 'TASK_STATUS_UPDATED') {
          const oldSt = log.oldStatus ? this.formatStatus(log.oldStatus) : '';
          const newSt = log.newStatus ? this.formatStatus(log.newStatus) : '';
          message = `${log.user.name} moved '${log.task?.title || 'Task'}' from ${oldSt} → ${newSt}`;
        } else if (log.action === 'TASK_CREATED') {
          message = `${log.user.name} created task '${log.task?.title || 'Task'}' in '${log.project.name}'`;
        } else if (log.action === 'PROJECT_CREATED') {
          message = `${log.user.name} created project '${log.project.name}'`;
        } else {
          message = `${log.user.name} performed ${log.action.toLowerCase()}`;
        }
      }

      return {
        id: log.id,
        projectId: log.projectId,
        projectName: log.project.name,
        taskId: log.taskId,
        taskTitle: log.task?.title || null,
        userId: log.userId,
        userName: log.user.name,
        userRole: log.user.role,
        action: log.action,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        formattedMessage: message,
        createdAt: log.createdAt,
      };
    });
  }

  private formatStatus(s: string): string {
    return s
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}

export const activitiesService = new ActivitiesService();
export default activitiesService;
