import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/pages/auth.routes';
import { TASKS_ROUTES } from './features/tasks/pages/tasks.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  ...AUTH_ROUTES,
  ...TASKS_ROUTES,
];
