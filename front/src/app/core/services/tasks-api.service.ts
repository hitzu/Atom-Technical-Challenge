import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@atom/shared';

type ApiResponse<T> = { data: T };

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  async list(): Promise<Task[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks`));
    return res.data;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Task>>(`${this.baseUrl}/tasks`, input),
    );
    return res.data;
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const res = await firstValueFrom(
      this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${encodeURIComponent(id)}`, input),
    );
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/tasks/${encodeURIComponent(id)}`));
  }

  async getById(id: string): Promise<Task> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Task>>(`${this.baseUrl}/tasks/${encodeURIComponent(id)}`));
    return res.data;
  }
}
