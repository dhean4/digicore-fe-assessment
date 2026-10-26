import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { TenantStore } from './part-b/tenant/tenant-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withComponentInputBinding()),
    // Resolve the bank and load its config before the first render, so routes, guards and
    // the theme see the right tenant from the start and nothing flashes unbranded.
    provideAppInitializer(() => inject(TenantStore).load()),
  ],
};
