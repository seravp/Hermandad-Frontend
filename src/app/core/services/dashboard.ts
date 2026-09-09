import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { DashboardTesoreria } from '../models/dashboard/dashboard-tesoreria';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  obtenerDashboard(): Observable<DashboardTesoreria> {
    return this.http.get<DashboardTesoreria>(`${environment.apiUrl}/cuotas/dashboard`);
  }
}
