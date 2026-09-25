import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from './tasks.schema.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/', validate({ query: taskQuerySchema }), tasksController.getTasks);
router.get('/:id', tasksController.getTaskById);

router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate({ body: createTaskSchema }),
  tasksController.createTask
);

router.patch(
  '/:id/status',
  validate({ body: updateTaskStatusSchema }),
  tasksController.updateTaskStatus
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate({ body: updateTaskSchema }),
  tasksController.updateTask
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  tasksController.deleteTask
);

export default router;
