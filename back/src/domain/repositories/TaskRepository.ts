import type { Task, UpdateTaskInput, ListTasksQuery } from '@atom/shared';

export interface TaskRepository {
  listByUserId(userId: string, query: ListTasksQuery): Promise<Task[]>;
  create(userId: string, input: { title: string; description?: string }): Promise<Task>;
  update(taskId: string, input: UpdateTaskInput): Promise<Task>;
  delete(taskId: string): Promise<void>;
  getById(taskId: string): Promise<Task>;
}

