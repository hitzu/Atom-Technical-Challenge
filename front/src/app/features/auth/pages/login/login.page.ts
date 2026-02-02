import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  private readonly AuthApiService = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    if (this.authApi.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      this.router.navigateByUrl(returnUrl || '/tasks');
    }
  }

  protected async onSubmit(): Promise<void> {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    if (this.form.invalid) return;
    const { email } = this.form.getRawValue();
    try {
      let response = await this.AuthApiService.getUserByEmail(email);
      if (!response) {
        response = await this.AuthApiService.signIn(email);

        this.successMessage.set('Usuario creado. Iniciando sesión...');

        this.authApi.setToken(response.token);
        this.authApi.setCurrentUser(response.data);

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;

        window.setTimeout(() => {
          this.router.navigateByUrl(returnUrl || '/tasks');
        }, 1200);

        return;
      }
      this.authApi.setToken(response.token);
      this.authApi.setCurrentUser(response.data);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      this.router.navigateByUrl(returnUrl || '/tasks');
    } catch (error) {
      this.errorMessage.set('Error al iniciar sesión');
    }
  }


}