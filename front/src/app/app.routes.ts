import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.page';
import { TasksPage } from './features/tasks/pages/tasks/tasks.page';
import { authGuard } from './core/auth/auth.guard';
import { TASKS_CHILD_ROUTES } from './features/tasks/pages/tasks.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'tasks',
    component: TasksPage,
    canActivate: [authGuard],
    children: TASKS_CHILD_ROUTES,
  },
  { path: '**', redirectTo: 'login' },
];
