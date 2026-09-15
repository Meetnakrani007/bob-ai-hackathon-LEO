import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(targets: ValidationTargets) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (targets.body) {
        req.body = await targets.body.parseAsync(req.body);
      }
      if (targets.query) {
        req.query = await targets.query.parseAsync(req.query);
      }
      if (targets.params) {
        req.params = await targets.params.parseAsync(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: err.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
}
