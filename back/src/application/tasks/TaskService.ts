import type { Task, UpdateTaskInput, ListTasksQuery } from '@atom/shared';

import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import { AppError } from '../../api/errors/AppError';

export class TaskService {
  public constructor(private readonly taskRepository: TaskRepository) { }

  private async validateUser(taskId: string, userId: string): Promise<void> {
    await this.getById(taskId, userId);
  }

  public async listByUserId(userId: string, query: ListTasksQuery): Promise<Task[]> {
    return this.taskRepository.listByUserId(userId, query);
  }

  public async create(userId: string, input: { title: string; description?: string }): Promise<Task> {
    return this.taskRepository.create(userId, input);
  }

  public async update(taskId: string, userId: string, input: UpdateTaskInput): Promise<Task> {
    await this.validateUser(taskId, userId);
    return this.taskRepository.update(taskId, input);
  }

  public async delete(taskId: string, userId: string): Promise<void> {
    await this.validateUser(taskId, userId);
    return this.taskRepository.delete(taskId);
  }

  public async getById(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.getById(taskId);
    if (task.userId !== userId) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN')
    }
    return task;
  }
}

