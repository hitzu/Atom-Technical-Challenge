import type { NextFunction, Request, Response } from 'express';
import { TaskService } from '../../application/tasks/TaskService';
import jwt from 'jsonwebtoken';

import { getEnvConfig } from '../../config/env';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

type DevTokenInfo = {
  version: string;   // e.g. "v1"
  userId: string;
  email: string;
  issuedAtMs: number;
};

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

    if (token.startsWith('DEV.')) {
      try {
        const dev = parseDevToken(token);
        req.user = { userId: dev.userId, email: dev.email };
        next();
        return;
      } catch {
        res.status(401).json({ error: { message: 'Invalid DEV token' } });
        return;
      }
    }

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

export function parseDevToken(token: string): DevTokenInfo {
  // Formato esperado:
  // DEV.<version>.id.<userId>.email.<email>.<timestampMs>

  if (!token.startsWith('DEV.')) throw new Error('Not a DEV token');

  const idMarker = '.id.';
  const emailMarker = '.email.';

  const idPos = token.indexOf(idMarker);
  const emailPos = token.indexOf(emailMarker);
  const lastDot = token.lastIndexOf('.');

  if (idPos === -1 || emailPos === -1) throw new Error('Missing id/email marker');
  if (emailPos <= idPos) throw new Error('Invalid marker order');
  if (lastDot <= emailPos + emailMarker.length) throw new Error('Missing timestamp');

  const version = token.slice('DEV.'.length, idPos); // "v1"
  const userId = token.slice(idPos + idMarker.length, emailPos);
  const email = token.slice(emailPos + emailMarker.length, lastDot);
  const tsStr = token.slice(lastDot + 1);

  const issuedAtMs = Number(tsStr);
  if (!Number.isFinite(issuedAtMs)) throw new Error('Invalid timestamp');

  if (!userId) throw new Error('Empty userId');
  if (!email) throw new Error('Empty email');

  return { version, userId, email, issuedAtMs };
}