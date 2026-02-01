import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/pages/auth.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  ...AUTH_ROUTES,
];
