import type { z } from 'zod';

import type { CreateTaskInputSchema, TaskSchema, UpdateTaskInputSchema } from '../validation/task.schema';

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

