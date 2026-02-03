import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Task, ListTasksQuery } from '@atom/shared';
import { TaskService } from '../../../../core/task/task.service';
import { Router } from '@angular/router';
import { YesNoPipe } from '../../../../core/pipes/yes-no.pipe';

@Component({
  selector: 'app-list-tasks-page',
  standalone: true,
  imports: [NgFor, NgIf, YesNoPipe, DatePipe],
  templateUrl: './list-tasks.page.html',
  styleUrl: './list-tasks.page.scss',
})
export class ListTasksPageComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  protected tasks: Task[] = [];
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly allTasks = signal<boolean>(false);
  protected readonly sort = signal<'asc' | 'desc'>('asc');

  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly pendingDeleteTask = signal<Task | null>(null);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly deleteErrorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const status = this.allTasks() ? undefined : 'PENDING';
      this.tasks = await this.taskService.listTasks({
        status,
        sort: this.sort(),
      });
    } catch {
      this.errorMessage.set('No se pudieron cargar las tareas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async toggleShowCompleted(): Promise<void> {
    this.allTasks.set(!this.allTasks());
    await this.loadTasks();
  }

  protected async toggleSort(): Promise<void> {
    this.sort.set(this.sort() === 'asc' ? 'desc' : 'asc');
    await this.loadTasks();
  }

  protected editTask(id: string): void {
    this.router.navigate(['/tasks/edit'], { queryParams: { id } });
  }

  protected openDeleteModal(task: Task): void {
    if (!task.id) {
      this.errorMessage.set('No se pudo eliminar la tarea: ID inválido.');
      return;
    }
    this.pendingDeleteTask.set(task);
    this.deleteErrorMessage.set(null);
    this.isDeleteModalOpen.set(true);
  }

  protected closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.pendingDeleteTask.set(null);
    this.deleteErrorMessage.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    if (this.isDeleting()) return;

    const task = this.pendingDeleteTask();
    if (!task?.id) {
      this.deleteErrorMessage.set('No se pudo eliminar la tarea: ID inválido.');
      return;
    }

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);
    try {
      await this.taskService.deleteTask(task.id);
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.closeDeleteModal();
    } catch {
      this.deleteErrorMessage.set('No se pudo eliminar la tarea.');
    } finally {
      this.isDeleting.set(false);
    }
  }
}

