import { Component,  OnInit } from '@angular/core';

import { DashboardService } from '../../../core/services/dashboard';
import { DashboardTesoreria } from '../../../core/models/dashboard-tesoreria';
import { JsonPipe } from '@angular/common';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);

  dashboard?: DashboardTesoreria;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.dashboardService.obtenerDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
      },

      error: (error) => {
        console.error(error);
      },
    });
  }
}
