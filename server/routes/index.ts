import { Router } from 'express';
import authRoutes from '../modules/authentication/authentication.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import clientsRoutes from '../modules/clients/clients.routes.js';
import projectsRoutes from '../modules/projects/projects.routes.js';
import tasksRoutes from '../modules/tasks/tasks.routes.js';
import activitiesRoutes from '../modules/activities/activities.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/clients', clientsRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/tasks', tasksRoutes);
apiRouter.use('/activity', activitiesRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
