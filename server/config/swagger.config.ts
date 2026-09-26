import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Velozity Global Solutions — Project Management & Activity Feed API',
    version: '1.0.0',
    description: `
Real-time client project dashboard backend with strict Role-Based Access Control (RBAC),
WebSocket live feeds, and background task management.

### Access Levels:
* **Admin**: Full access across clients, projects, users, and global activity.
* **Project Manager**: Create & manage owned projects, assign tasks, view team activity.
* **Developer**: View assigned tasks only, update task status.
    `,
    contact: {
      name: 'Velozity Engineering Team',
      email: 'engineering@velozity.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT || 5000}`,
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User login, token refresh, logout, and profile endpoints' },
    { name: 'Dashboard', description: 'Role-aware analytics, KPI metrics, and summary data' },
    { name: 'Projects', description: 'Client project initiatives, manager assignments, and deliverables' },
    { name: 'Tasks', description: 'Kanban tasks, priority tags, due dates, and status transitions' },
    { name: 'Users', description: 'Team personnel directory, system roles, and account provisioning' },
    { name: 'Clients', description: 'Client organization management' },
    { name: 'Activity Feed', description: 'Live audit log feed and chronological event streams' },
    { name: 'Notifications', description: 'In-app notification system and unread alerts' },
    { name: 'Health', description: 'System availability and status check' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (Bearer <token>)',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly refresh token cookie for session renewal',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'd3b07384-d113-424a-a71f-0e6d634ed1a3' },
          name: { type: 'string', example: 'Priya Sharma' },
          email: { type: 'string', format: 'email', example: 'priya@velozity.com' },
          role: { type: 'string', enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'], example: 'PROJECT_MANAGER' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Client: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Acme Corp' },
          email: { type: 'string', format: 'email', example: 'contact@acmecorp.com' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'E-commerce Platform' },
          description: { type: 'string', example: 'Online retail application redesign' },
          clientId: { type: 'string', format: 'uuid' },
          managerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'API integration' },
          description: { type: 'string', example: 'Integrate payment gateway with system' },
          assignedTo: { type: 'string', format: 'uuid', nullable: true },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'], example: 'IN_PROGRESS' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          dueDate: { type: 'string', format: 'date-time' },
          isOverdue: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          taskId: { type: 'string', format: 'uuid', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          action: { type: 'string', example: 'moved Task #12 from In Progress to In Review' },
          oldStatus: { type: 'string', nullable: true },
          newStatus: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string', example: 'TASK_ASSIGNED' },
          message: { type: 'string', example: 'You have been assigned to Task #6' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'FORBIDDEN' },
              message: { type: 'string', example: 'You do not have permission to perform this action' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API server health status',
        responses: {
          200: {
            description: 'Server is running healthily',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'UP' },
                    timestamp: { type: 'string' },
                    environment: { type: 'string', example: 'development' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user with email & password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@velozity.com' },
                  password: { type: 'string', example: 'Password@123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful, returns access token and user info',
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using HttpOnly cookie',
        responses: {
          200: { description: 'Token refreshed successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current user & revoke refresh token',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get logged-in user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/dashboard/metrics': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get role-aware dashboard statistics and KPI metrics',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Role-specific summary dashboard statistics' },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects with optional filtering',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search project name' },
          { name: 'clientId', in: 'query', schema: { type: 'string' }, description: 'Filter by Client UUID' },
        ],
        responses: {
          200: { description: 'List of projects' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project (Admin / Project Manager only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'clientId', 'managerId'],
                properties: {
                  name: { type: 'string', example: 'Mobile App Redesign' },
                  description: { type: 'string', example: 'Cross platform mobile client app' },
                  clientId: { type: 'string', format: 'uuid' },
                  managerId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Project created successfully' },
          403: { description: 'Insufficient permissions' },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project details with tasks and client' },
          404: { description: 'Project not found' },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Update existing project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project updated successfully' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted successfully' },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks (Kanban & filtered view)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] } },
          { name: 'assignedTo', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of matching tasks' },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectId', 'title', 'dueDate'],
                properties: {
                  projectId: { type: 'string', format: 'uuid' },
                  title: { type: 'string', example: 'API integration' },
                  description: { type: 'string', example: 'Integrate payment gateway' },
                  assignedTo: { type: 'string', format: 'uuid' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
                  dueDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created successfully' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task details' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update task details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task updated' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task deleted' },
        },
      },
    },
    '/api/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Update task status (Triggers real-time WebSocket broadcast)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated and event broadcasted' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users directory',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] } },
        ],
        responses: {
          200: { description: 'User list' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create team member account (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Alex Morgan' },
                  email: { type: 'string', example: 'alex@velozity.com' },
                  password: { type: 'string', example: 'Password@123' },
                  role: { type: 'string', enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User details' },
        },
      },
    },
    '/api/clients': {
      get: {
        tags: ['Clients'],
        summary: 'List all client organizations',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Clients list' },
        },
      },
      post: {
        tags: ['Clients'],
        summary: 'Create client (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'NextGen Ltd' },
                  email: { type: 'string', example: 'info@nextgen.com' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Client created' },
        },
      },
    },
    '/api/activity/feed': {
      get: {
        tags: ['Activity Feed'],
        summary: 'Get live activity audit log feed',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Activity logs feed' },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get user notifications',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Notifications list' },
        },
      },
    },
    '/api/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' },
        },
      },
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark single notification as read',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Notification marked as read' },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
