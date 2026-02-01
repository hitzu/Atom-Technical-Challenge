import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginComponent implements OnInit {
  // private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly errorMessage = signal<string | null>(null);

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    // if (this.auth.isAuthenticated()) {
    //   const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    //   this.router.navigate([returnUrl || '/']);
    // }
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    // const { error } = await this.auth.signIn(email, password);
    // if (error) {
    //   this.errorMessage.set(error.message);
    //   return;
    // }
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    this.router.navigate([returnUrl || '/']);
  }
}