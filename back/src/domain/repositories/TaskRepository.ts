import type { Task, UpdateTaskInput } from '@atom/shared';

export interface TaskRepository {
  listByUserId(userId: string): Promise<Task[]>;
  create(userId: string, input: { title: string; description?: string }): Promise<Task>;
  update(taskId: string, input: UpdateTaskInput): Promise<Task>;
  delete(taskId: string): Promise<void>;
}

