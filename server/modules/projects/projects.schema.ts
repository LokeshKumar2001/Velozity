import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  clientId: z.string().uuid('Valid client ID is required'),
  managerId: z.string().uuid().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  clientId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  clientId: z.string().uuid().optional(),
});
