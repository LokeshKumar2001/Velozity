import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.config.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(authenticateToken);

const createClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  requireRole(UserRole.ADMIN),
  validate({ body: createClientSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await prisma.client.create({
        data: {
          name: req.body.name.trim(),
          email: req.body.email.toLowerCase().trim(),
        },
      });
      res.status(201).json({ success: true, message: 'Client created successfully', data: client });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
