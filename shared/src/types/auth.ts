import type { z } from 'zod';

import type { GetUserByEmailPathSchema, CreateUserBodySchema, UserLoggedInResponseSchema } from '../validation/auth.schema';
import type { StoredUserSchema } from '../validation/user.schema';

export type AuthUser = z.infer<typeof StoredUserSchema>;
export type GetUserByEmailPath = z.infer<typeof GetUserByEmailPathSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type UserLoggedInResponse = z.infer<typeof UserLoggedInResponseSchema>;

