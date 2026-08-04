import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { materialProviders } from './shared/material/material';

import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth';
import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './shared/material/paginator-intl';


export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: MatPaginatorIntl,
      useFactory: getSpanishPaginatorIntl,
    },

    provideNativeDateAdapter(),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    materialProviders,
  ],
};
