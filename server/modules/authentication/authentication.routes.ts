import { Router } from 'express';
import { authController } from './authentication.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { loginSchema } from './authentication.schema.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

export default router;
