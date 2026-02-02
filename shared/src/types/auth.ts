import type { z } from 'zod';

import type { LoginOrCreateBodySchema, LoginOrCreateResponseSchema } from '../validation/auth.schema';
import type { StoredUserSchema } from '../validation/user.schema';

export type AuthUser = z.infer<typeof StoredUserSchema>;
export type LoginOrCreateBody = z.infer<typeof LoginOrCreateBodySchema>;
export type LoginResponse = z.infer<typeof LoginOrCreateResponseSchema>;

