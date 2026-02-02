import type { Task, UpdateTaskInput } from '@atom/shared';

import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class TaskService {
  public constructor(private readonly taskRepository: TaskRepository) { }

  private async validateUser(taskId: string, userId: string): Promise<void> {
    const task = await this.getById(taskId);
    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }
  }

  public async listByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository.listByUserId(userId);
  }

  public async create(userId: string, input: { title: string; description?: string }): Promise<Task> {
    return this.taskRepository.create(userId, input);
  }

  public async update(taskId: string, userId: string, input: UpdateTaskInput): Promise<Task> {
    this.validateUser(taskId, userId);
    return this.taskRepository.update(taskId, input);
  }

  public async delete(taskId: string, userId: string): Promise<void> {
    this.validateUser(taskId, userId);
    return this.taskRepository.delete(taskId);
  }

  public async getById(taskId: string): Promise<Task> {
    return this.taskRepository.getById(taskId);
  }
}

