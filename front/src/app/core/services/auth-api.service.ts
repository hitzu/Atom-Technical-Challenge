import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserLoggedInResponse } from '@atom/shared';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

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
