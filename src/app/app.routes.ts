import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';

import { LayoutComponent } from './features/dashboard/layout/layout';

import { DashboardComponent } from './features/dashboard/dashboard/dashboard';

import { ListadoComponent } from './features/hermanos/listado/listado';

import { ListadoComponent as ListadoCuotasComponent } from './features/cuotas/listado/listado';

import { ConfiguracionComponent } from './features/configuracion/configuracion/configuracion';

import { ListadoComponent as ListadoMorososComponent } from './features/morosos/listado/listado';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },

      {
        path: 'hermanos',
        component: ListadoComponent,
      },

      {
        path: 'cuotas',
        component: ListadoCuotasComponent,
      },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
      },
      {
        path: 'morosos',
        component: ListadoMorososComponent,
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
