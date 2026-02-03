import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserLoggedInResponse } from '@atom/shared';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  // In prod we use same-origin (/api is rewritten by Firebase Hosting to the function).
  // In local dev, the API runs on :4000.
  private readonly baseUrl =
    typeof window === 'undefined'
      ? 'http://localhost:4000/api'
      : window.location.hostname === 'localhost'
        ? 'http://localhost:4000/api'
        : `${window.location.origin}/api`;

  async signIn(email: string): Promise<UserLoggedInResponse> {
    return firstValueFrom(
      this.http.post<UserLoggedInResponse>(`${this.baseUrl}/auth/sign-in`, {
        email,
      }),
    );
  }

  async getUserByEmail(email: string): Promise<UserLoggedInResponse | null> {
    try {
      return await firstValueFrom(
        this.http.get<UserLoggedInResponse>(`${this.baseUrl}/users/${email}`),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) return null;
      throw error;
    }
  }
}
