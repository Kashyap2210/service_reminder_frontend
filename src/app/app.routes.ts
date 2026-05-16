import { Routes } from '@angular/router';

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
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then((m) => m.Signup),
  },
];
