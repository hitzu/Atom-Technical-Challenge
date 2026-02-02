import { z } from 'zod';

import { StoredUserSchema } from './user.schema';

/**
 * Shared auth primitives
 */
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const JwtTokenSchema = z.string().min(1);

/**
 * POST /auth/login-or-create
 */
export const LoginOrCreateBodySchema = z.object({
  email: EmailSchema,
});

export const LoginOrCreateResponseSchema = z.object({
  data: StoredUserSchema,
  token: JwtTokenSchema,
});

