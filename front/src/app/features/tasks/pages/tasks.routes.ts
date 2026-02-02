import { Routes } from '@angular/router';
import { TasksPage } from './tasks/tasks.page';

export const TASKS_ROUTES: Routes = [
  {
    path: 'tasks',
    component: TasksPage,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      {
        path: 'list',
        loadComponent: () =>
          import('./list-tasks/list-tasks.page').then((m) => m.ListTasksPageComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./create-task/create-task.page').then((m) => m.CreateTaskPageComponent),
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('./edit-task/edit-task.page').then((m) => m.EditTaskPageComponent),
      },
    ],
  },
];