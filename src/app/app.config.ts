import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { materialProviders } from './shared/material/material';

import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth';
import { LOCALE_ID } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { SpanishDateAdapter } from './shared/material/spanish-date-adapter';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './shared/material/paginator-intl';


export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: null },
        display: {
          dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
          monthYearLabel: { month: 'short', year: 'numeric' },
          dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
          monthYearA11yLabel: { month: 'long', year: 'numeric' },
        },
      },
    },
    {
      provide: MatPaginatorIntl,
      useFactory: getSpanishPaginatorIntl,
    },

    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: SpanishDateAdapter },
    provideHttpClient(withInterceptors([authInterceptor])),

    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    materialProviders,
  ],
};
