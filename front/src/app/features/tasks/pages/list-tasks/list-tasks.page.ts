import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Task } from '@atom/shared';
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

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.tasks = await this.taskService.listTasks();
    } catch {
      this.errorMessage.set('No se pudieron cargar las tareas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected editTask(id: string): void {
    this.router.navigate(['/tasks/edit'], { queryParams: { id } });
  }

  protected deleteTask(id: string): void {
    this.taskService.deleteTask(id);
  }
}

