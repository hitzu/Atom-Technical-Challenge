import { z } from 'zod';

import { StoredUserSchema } from './user.schema';

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const JwtTokenSchema = z.string().min(1);

export const GetUserByEmailPathSchema = z.object({
  email: EmailSchema,
});

export const CreateUserBodySchema = z.object({
  email: EmailSchema,
});

export const UserLoggedInResponseSchema = z.object({
  data: StoredUserSchema,
  token: JwtTokenSchema,
});


