import { Router } from 'express';
import { activitiesController } from './activities.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/feed', activitiesController.getFeed);

export default router;
