import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  //   console.log(isPlatformBrowser(platformId));

  // Guard against SSR where localStorage doesn't exist
  if (!isPlatformBrowser(platformId)) {
    // return router.createUrlTree(['/login']);
    return true;
  }

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  //   console.log('isBrowser:', isPlatformBrowser(platformId));
  //   console.log('token:', token); // 👈
  //   console.log('user:', user); // 👈

  if (!token || !user) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
