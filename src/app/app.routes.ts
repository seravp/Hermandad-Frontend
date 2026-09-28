import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';

import { LayoutComponent } from './features/dashboard/layout/layout';

import { DashboardComponent } from './features/dashboard/dashboard/dashboard';

import { ListadoComponent } from './features/socios/listado/listado';

import { ListadoComponent as ListadoCuotasComponent } from './features/cuotas/listado/listado';

import { ConfiguracionComponent } from './features/configuracion/configuracion/configuracion';

import { ListadoComponent as ListadoMorososComponent } from './features/morosos/listado/listado';

import { ListadoUsuariosComponent } from './features/usuarios/listado/listado';

import { ListadoInformesComponent } from './features/informes/listado/listado';

import { ListadoAuditoriaComponent } from './features/auditoria/listado/listado';
import { ListadoInventarioComponent } from './features/inventario/listado/listado';
import { RevisionesInventarioComponent } from './features/inventario/revisiones/revisiones';
import { CuadrillasComponent } from './features/cuadrillas/cuadrillas';

import { informesGuard } from './core/guards/informes-guard';

import { authGuard } from './core/guards/auth-guard';

import { adminGuard } from './core/guards/admin-guard';

import { cuotasGuard } from './core/guards/cuotas-guard';
import { cuadrillasGuard } from './core/guards/cuadrillas-guard';
import { inventarioRevisionesGuard } from './core/guards/inventario-revisiones-guard';

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
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },

      {
        path: 'socios',
        component: ListadoComponent,
      },
      {
        path: 'cuadrillas',
        component: CuadrillasComponent,
        canActivate: [cuadrillasGuard],
      },

      {
        path: 'cuotas',
        component: ListadoCuotasComponent,
        canActivate: [cuotasGuard],
      },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'morosos',
        component: ListadoMorososComponent,
        canActivate: [informesGuard],
      },

      {
        path: 'usuarios',
        component: ListadoUsuariosComponent,
        canActivate: [adminGuard],
      },

      {
        path: 'informes',
        component: ListadoInformesComponent,
        canActivate: [informesGuard],
      },

      {
        path: 'auditoria',
        component: ListadoAuditoriaComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'inventario/revisiones',
        component: RevisionesInventarioComponent,
        canActivate: [inventarioRevisionesGuard],
      },
      {
        path: 'inventario',
        component: ListadoInventarioComponent,
        pathMatch: 'full',
      },

    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
