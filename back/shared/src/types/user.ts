import type { z } from 'zod';

import type { StoredUserSchema, UserSchema } from '../validation/user.schema';

export type User = z.infer<typeof StoredUserSchema>;
export type UserInput = z.infer<typeof UserSchema>;

