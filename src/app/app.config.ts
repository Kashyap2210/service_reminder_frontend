import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { VALIDATION_MESSAGES } from './validation/validation-messages';
import { VALIDATION_MESSAGES_TOKEN } from './validation/validation-messages.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withFetch()),
    provideRouter(routes),
    // provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    { provide: VALIDATION_MESSAGES_TOKEN, useValue: VALIDATION_MESSAGES },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
