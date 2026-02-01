import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { getEnvConfig } from '../../config/env';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const config = getEnvConfig();

  const authHeader = req.header('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      req.user = { userId: decoded.userId, email: decoded.email };
      next();
      return;
    } catch {
      res.status(401).json({ error: { message: 'Invalid token' } });
      return;
    }
  }

  if (config.allowInsecureHeaderAuth) {
    const userId = req.header('x-user-id');
    const email = req.header('x-user-email');
    if (userId && email) {
      req.user = { userId, email };
      next();
      return;
    }
  }

  res.status(401).json({ error: { message: 'Unauthorized' } });
}

