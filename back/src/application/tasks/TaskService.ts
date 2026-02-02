import type { Task, UpdateTaskInput } from '@atom/shared';

import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class TaskService {
  public constructor(private readonly taskRepository: TaskRepository) { }

  public async listByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository.listByUserId(userId);
  }

  public async create(userId: string, input: { title: string; description?: string }): Promise<Task> {
    return this.taskRepository.create(userId, input);
  }

  public async update(taskId: string, input: UpdateTaskInput): Promise<Task> {
    return this.taskRepository.update(taskId, input);
  }

  public async delete(taskId: string): Promise<void> {
    return this.taskRepository.delete(taskId);
  }

  public async getById(taskId: string): Promise<Task> {
    return this.taskRepository.getById(taskId);
  }
}

