import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().min(1).optional(),
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  completed: z.boolean(),
});

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const UpdateTaskInputSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

