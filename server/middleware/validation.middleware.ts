import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (targets: ValidationTargets) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (targets.body) {
        req.body = await targets.body.parseAsync(req.body);
      }
      if (targets.query) {
        const parsedQuery = (await targets.query.parseAsync(req.query)) as Record<string, any>;
        for (const key of Object.keys(req.query)) {
          delete (req.query as Record<string, any>)[key];
        }
        Object.assign(req.query, parsedQuery);
      }
      if (targets.params) {
        const parsedParams = (await targets.params.parseAsync(req.params)) as Record<string, any>;
        for (const key of Object.keys(req.params)) {
          delete (req.params as Record<string, any>)[key];
        }
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(error);
      }
    }
  };
};

export default validate;
