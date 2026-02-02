import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { UpdateTaskInput } from '@atom/shared';
import { TaskService } from '../../../../core/task/task.service';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './edit-task.page.html',
  styleUrl: './edit-task.page.scss',
})
export class EditTaskPageComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Nota: la ruta actual es `/tasks/edit`. Para la maqueta, tomamos el id desde query param `?id=...`.
  private get taskId(): string | null {
    return this.route.snapshot.queryParamMap.get('id');
  }

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    completed: [false],
  });

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const id = this.taskId;
    if (!id) {
      this.errorMessage.set('Falta el id de la tarea (usa /tasks/edit?id=...).');
      this.isLoading.set(false);
      return;
    }

    try {
      const task = await this.taskService.getTaskById(id);
      this.form.patchValue({
        title: task.title,
        description: task.description ?? '',
        completed: task.completed,
      });
    } catch {
      this.errorMessage.set('No se pudo cargar la tarea.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    const id = this.taskId;
    if (!id) {
      this.errorMessage.set('Falta el id de la tarea (usa /tasks/edit?id=...).');
      return;
    }

    const raw = this.form.getRawValue();
    const input: UpdateTaskInput = {
      title: raw.title,
      description: raw.description || undefined,
      completed: raw.completed,
    };

    this.isSubmitting.set(true);
    try {
      await this.taskService.updateTask(id, input);
      await this.router.navigate(['/tasks/list']);
    } catch {
      this.errorMessage.set('No se pudo actualizar la tarea.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/tasks/list']);
  }
}

