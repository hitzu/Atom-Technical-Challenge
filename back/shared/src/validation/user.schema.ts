import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1).optional(),
  email: z.string().email(),
  createdAt: z.string().datetime().optional(),
});

export const StoredUserSchema = UserSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});

