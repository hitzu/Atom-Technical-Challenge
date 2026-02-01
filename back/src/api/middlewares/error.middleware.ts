import type { NextFunction, Request, Response } from 'express';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : 'Unexpected error';

  res.status(500).json({
    error: {
      message,
    },
  });
}

