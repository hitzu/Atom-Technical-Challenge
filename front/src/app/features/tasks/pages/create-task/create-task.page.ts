import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
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
export class CreateTaskPageComponent implements AfterViewInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  @ViewChild('titleInput') private titleInput?: ElementRef<HTMLInputElement>;

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hasTriedSubmit = signal<boolean>(false);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  protected isInvalid(controlName: 'title' | 'description'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.hasTriedSubmit());
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.titleInput?.nativeElement.focus(), 0);
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.hasTriedSubmit.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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

