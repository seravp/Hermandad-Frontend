import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InformeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/informes`;

  generarInformeMorosos(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/morosos`, {
      responseType: 'blob',
    });
  }

  generarInformeDomiciliados(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/domiciliados`, {
      responseType: 'blob',
    });
  }

  generarCartaMoroso(socioId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/carta-moroso/${socioId}`, {
      responseType: 'blob',
    });
  }

  exportarExcelSocios(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel/socios`, {
      responseType: 'blob',
    });
  }

  exportarExcelMorosos(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel/morosos`, {
      responseType: 'blob',
    });
  }

  exportarExcelCuotas(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel/cuotas`, {
      responseType: 'blob',
    });
  }
}
