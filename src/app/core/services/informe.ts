import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CartaGuardada {
  id: number;
  nombreArchivo: string;
  formato: string;
  destinatarios: string;
  fechaGeneracion: string;
  carpeta: string;
}

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

  generarCartas(solicitud: { sociosIds: number[]; cuerpo: string; formato: 'PDF' | 'WORD'; modoGeneracion: 'UNICO' | 'SEPARADOS' }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/cartas`, solicitud, { responseType: 'blob' });
  }

  listarCartasGuardadas(): Observable<CartaGuardada[]> {
    return this.http.get<CartaGuardada[]>(`${this.apiUrl}/cartas/guardadas`);
  }

  descargarCartaGuardada(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cartas/guardadas/${id}`, { responseType: 'blob' });
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
