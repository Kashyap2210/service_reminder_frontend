import { Routes } from '@angular/router';
import { EntityList } from 'service_reminder_common';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/user-profile/user-profile').then((m) => m.UserProfile),
  },
  {
    path: EntityList.RECURRING_ITEM,
    loadComponent: () =>
      import('./components/recurring-item/recurring-item').then((m) => m.RecurringItem),
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
