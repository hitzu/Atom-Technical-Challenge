import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { CreateTaskInput } from '@atom/shared';
import { TaskService } from '../../../../core/task/task.service';

@Component({
  selector: 'app-create-task-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './create-task.page.html',
  styleUrl: './create-task.page.scss',
})
export class CreateTaskPageComponent {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const input: CreateTaskInput = {
      title: raw.title,
      description: raw.description || undefined,
    };

    this.isSubmitting.set(true);
    try {
      await this.taskService.createTask(input);
      await this.router.navigate(['/tasks/list']);
    } catch {
      this.errorMessage.set('No se pudo crear la tarea.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/tasks/list']);
  }
}

