import { Router } from 'express';
import { projectsController } from './projects.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from './projects.schema.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/', validate({ query: projectQuerySchema }), projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);

router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate({ body: createProjectSchema }),
  projectsController.createProject
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate({ body: updateProjectSchema }),
  projectsController.updateProject
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  projectsController.deleteProject
);

export default router;
