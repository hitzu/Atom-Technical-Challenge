import { Injectable, inject } from '@angular/core';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@atom/shared';
import { TasksApiService } from '../services/tasks-api.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksApi = inject(TasksApiService);

  async listTasks(): Promise<Task[]> {
    return this.tasksApi.list();
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.tasksApi.create(input);
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.tasksApi.update(id, input);
  }

  async deleteTask(id: string): Promise<void> {
    return this.tasksApi.delete(id);
  }

  async getTaskById(id: string): Promise<Task> {
    return this.tasksApi.getById(id);
  }
}

