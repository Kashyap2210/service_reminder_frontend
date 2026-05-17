import { Routes } from '@angular/router';
import { EntityList } from 'service_reminder_common';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/user-profile/user-profile').then((m) => m.UserProfile),
  },
  {
    path: EntityList.RECURRING_ITEM,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/recurring-item/recurring-item').then((m) => m.RecurringItem),
  },
  {
    path: EntityList.APPOINTMENT,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/appointment/appointment').then((m) => m.Appointment),
  },
  {
    path: EntityList.SERVICE,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/service/service').then((m) => m.Service),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then((m) => m.Signup),
  },
];
