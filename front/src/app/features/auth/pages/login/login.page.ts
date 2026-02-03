import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import type { UserLoggedInResponse } from '@atom/shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isCreateUserModalOpen = signal(false);
  protected readonly pendingEmail = signal<string | null>(null);

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      this.router.navigateByUrl(returnUrl || '/tasks');
    }
  }

  protected async onSubmit(): Promise<void> {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isSubmitting.set(false);
      return;
    }

    this.isSubmitting.set(true);
    const { email } = this.form.getRawValue();
    try {
      const response = await this.authApiService.getUserByEmail(email);
      if (!response) {
        this.pendingEmail.set(email);
        this.isCreateUserModalOpen.set(true);
        return;
      }

      this.finishLogin(response);
    } catch (error) {
      this.errorMessage.set('Error al iniciar sesión');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected closeCreateUserModal(): void {
    this.isCreateUserModalOpen.set(false);
    this.pendingEmail.set(null);
  }

  protected async confirmCreateUser(): Promise<void> {
    const email = this.pendingEmail();
    if (!email) return;

    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const response = await this.authApiService.signIn(email);
      this.successMessage.set('Usuario creado. Iniciando sesión...');
      this.finishLogin(response, { delayMs: 1200 });
      this.isCreateUserModalOpen.set(false);
      this.pendingEmail.set(null);
    } catch (error) {
      this.errorMessage.set('No se pudo crear el usuario');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private finishLogin(
    response: UserLoggedInResponse,
    options?: { delayMs?: number },
  ): void {
    this.authService.setToken(response.token);
    this.authService.setCurrentUser(response.data);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    const url = returnUrl || '/tasks';

    if (options?.delayMs) {
      window.setTimeout(() => this.router.navigateByUrl(url), options.delayMs);
      return;
    }

    this.router.navigateByUrl(url);
  }
}