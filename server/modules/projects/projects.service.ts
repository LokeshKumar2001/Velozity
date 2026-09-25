import { ProjectsRepository, projectsRepository } from './projects.repository.js';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFilterQuery } from './projects.types.js';
import { AppError } from '../../errors/app-error.js';
import { AuthUser } from '../../types/express.js';
import { prisma } from '../../config/database.config.js';
import { broadcastActivity } from '../../infrastructure/websocket/socket.server.js';

export class ProjectsService {
  constructor(private repo: ProjectsRepository = projectsRepository) {}

  async getProjects(filters: ProjectFilterQuery, user: AuthUser) {
    return this.repo.findAll(filters, user.role, user.id);
  }

  async getProjectById(id: string, user: AuthUser) {
    const project = await this.repo.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    // Role-based visibility check
    if (user.role === 'PROJECT_MANAGER' && project.managerId !== user.id) {
      throw AppError.forbidden('You do not have access to view this project');
    }

    if (user.role === 'DEVELOPER') {
      const isAssigned = project.tasks.some((t) => t.assignedTo === user.id);
      if (!isAssigned) {
        throw AppError.forbidden('You do not have access to view this project');
      }
    }

    return project;
  }

  async createProject(dto: CreateProjectDTO, user: AuthUser) {
    // If PM creates, managerId is always their own id
    const managerId = user.role === 'PROJECT_MANAGER' ? user.id : dto.managerId || user.id;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw AppError.notFound('Selected client does not exist');
    }

    const project = await this.repo.create({
      ...dto,
      managerId,
    });

    // Create activity log
    const activity = await prisma.activityLog.create({
      data: {
        projectId: project.id,
        userId: user.id,
        action: 'PROJECT_CREATED',
        metadata: {
          projectTitle: project.name,
          message: `${user.name} created a new project '${project.name}'`,
        },
      },
    });

    // Broadcast real-time activity
    broadcastActivity({
      id: activity.id,
      projectId: project.id,
      taskId: null,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: activity.action,
      formattedMessage: `${user.name} created a new project '${project.name}'`,
      createdAt: activity.createdAt.toISOString(),
    });

    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDTO, user: AuthUser) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound('Project not found');
    }

    // PM can only edit their own project
    if (user.role === 'PROJECT_MANAGER' && existing.managerId !== user.id) {
      throw AppError.forbidden('You can only edit projects you created');
    }

    return this.repo.update(id, dto);
  }

  async deleteProject(id: string, user: AuthUser) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound('Project not found');
    }

    if (user.role === 'PROJECT_MANAGER' && existing.managerId !== user.id) {
      throw AppError.forbidden('You can only delete projects you created');
    }

    return this.repo.delete(id);
  }
}

export const projectsService = new ProjectsService();
export default projectsService;
