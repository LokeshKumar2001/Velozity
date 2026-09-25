import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createUserSchema, userQuerySchema } from './users.schema.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/', validate({ query: userQuerySchema }), usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.post(
  '/',
  requireRole(UserRole.ADMIN),
  validate({ body: createUserSchema }),
  usersController.createUser
);

export default router;
