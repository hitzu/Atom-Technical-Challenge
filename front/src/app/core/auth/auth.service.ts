import { Injectable } from '@angular/core';
import { AuthUser } from '@atom/shared';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() { }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public setCurrentUser(user: AuthUser): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    if (!user) {
      return null;
    }
    return JSON.parse(user);
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}