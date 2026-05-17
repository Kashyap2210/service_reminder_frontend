import { InjectionToken } from '@angular/core';

export const VALIDATION_MESSAGES_TOKEN = new InjectionToken<Record<string, (val?: any) => string>>(
  'VALIDATION_MESSAGES',
);
