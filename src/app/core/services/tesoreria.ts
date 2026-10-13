import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComparativaTesoreria, MovimientoTesoreria, MovimientoTesoreriaRequest, ResumenTesoreria, TipoMovimientoTesoreria } from '../models/tesoreria/tesoreria';
import { Page } from '../models/page';

@Injectable({ providedIn: 'root' })
export class TesoreriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tesoreria`;
  resumen(desde?: string, hasta?: string): Observable<ResumenTesoreria> { let params = new HttpParams(); if (desde) params = params.set('desde', desde); if (hasta) params = params.set('hasta', hasta); return this.http.get<ResumenTesoreria>(`${this.apiUrl}/resumen`, { params }); }
  movimientos(tipo?: TipoMovimientoTesoreria, categoria?: string, desde?: string, hasta?: string, page = 0, size = 10): Observable<Page<MovimientoTesoreria>> { let params = new HttpParams().set('page', page).set('size', size); if (tipo) params = params.set('tipo', tipo); if (categoria) params = params.set('categoria', categoria); if (desde) params = params.set('desde', desde); if (hasta) params = params.set('hasta', hasta); return this.http.get<Page<MovimientoTesoreria>>(`${this.apiUrl}/movimientos`, { params }); }
  categorias(): Observable<string[]> { return this.http.get<string[]>(`${this.apiUrl}/categorias`); }
  anios(): Observable<number[]> { return this.http.get<number[]>(`${this.apiUrl}/anios`); }
  comparativa(anioBase: number, anioComparativo: number): Observable<ComparativaTesoreria> { return this.http.get<ComparativaTesoreria>(`${this.apiUrl}/comparativa`, { params: { anioBase, anioComparativo } }); }
  exportarExcel(tipo?: TipoMovimientoTesoreria, categoria?: string, desde?: string, hasta?: string): Observable<Blob> { let params = new HttpParams(); if (tipo) params = params.set('tipo', tipo); if (categoria) params = params.set('categoria', categoria); if (desde) params = params.set('desde', desde); if (hasta) params = params.set('hasta', hasta); return this.http.get(`${this.apiUrl}/exportar-excel`, { params, responseType: 'blob' }); }
  crear(request: MovimientoTesoreriaRequest): Observable<MovimientoTesoreria> { return this.http.post<MovimientoTesoreria>(`${this.apiUrl}/movimientos`, request); }
  actualizar(id: number, request: MovimientoTesoreriaRequest): Observable<MovimientoTesoreria> { return this.http.put<MovimientoTesoreria>(`${this.apiUrl}/movimientos/${id}`, request); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/movimientos/${id}`); }
}
