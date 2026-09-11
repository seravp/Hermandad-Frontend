import { Component,  OnInit } from '@angular/core';

import { DashboardService } from '../../../core/services/dashboard';
import { Dashboard } from '../../../core/models/dashboard/dashboard';
import { JsonPipe } from '@angular/common';

import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log('DashboardComponent', this);
  }

  dashboard: Dashboard = {
    totalHermanos: 0,
    cuotasPagadas: 0,
    cuotasPendientes: 0,
    morosos: 0,
    importeRecaudado: 0,
    importePendiente: 0,
    anioActivo: 0,
    totalCuotas: 0,
    porcentajeCobrado: 0,
  };

  ngOnInit(): void {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (data) => {
        this.dashboard = { ...data };

        console.log('ANTES', this.dashboard);

        this.cdr.detectChanges();

        console.log('DESPUÉS', this.dashboard);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  get colorProgreso(): 'primary' | 'accent' | 'warn' {
    const porcentaje = this.dashboard.porcentajeCobrado;

    if (porcentaje < 40) {
      return 'warn';
    }

    if (porcentaje < 80) {
      return 'accent';
    }

    return 'primary';
  }

  get textoEstado(): string {
    const porcentaje = this.dashboard.porcentajeCobrado;

    if (porcentaje < 40) {
      return 'Cobro bajo';
    }

    if (porcentaje < 80) {
      return 'Cobro en progreso';
    }

    return 'Cobro casi completado';
  }

  get claseProgreso(): string {
    const porcentaje = this.dashboard.porcentajeCobrado;

    if (porcentaje < 40) {
      return 'progress-rojo';
    }

    if (porcentaje < 80) {
      return 'progress-naranja';
    }

    return 'progress-verde';
  }

  get iconoEstado(): string {
    const p = this.dashboard.porcentajeCobrado;

    if (p < 40) return 'warning';

    if (p < 80) return 'schedule';

    return 'check_circle';
  }
}
