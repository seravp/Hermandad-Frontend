import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Cuota } from '../models/cuotas/cuota';
import { CuotaDetalle } from '../models/cuotas/cuota-detalle';
import { CuotaRequest } from '../../features/socios/models/cuota-request';
import { Page } from '../models/page';
import { TipoSocio } from '../models/socios/tipo-socio';



@Injectable({
  providedIn: 'root',
})
export class CuotaService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/cuotas`;

  buscar(
    texto: string,
    estado: string | undefined,
    anio: number | undefined,
    tipo: TipoSocio | undefined,
    cuadrilla: string | undefined,
    page: number,
    size: number,
    sort: string,
    direction: string,
  ): Observable<Page<Cuota>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort)
      .set('direction', direction);

    if (texto) {
      params = params.set('texto', texto);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (anio) {
      params = params.set('anio', anio);
    }

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    if (cuadrilla) {
      params = params.set('cuadrilla', cuadrilla);
    }

    return this.http.get<Page<Cuota>>(`${this.apiUrl}/busqueda-paginada`, { params });
  }

  obtenerPorId(id: number): Observable<CuotaDetalle> {
    return this.http.get<CuotaDetalle>(`${this.apiUrl}/${id}`);
  }

  obtenerPorSocio(socioId: number): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(`${this.apiUrl}/socio/${socioId}`);
  }

  crear(request: CuotaRequest): Observable<CuotaDetalle> {
    return this.http.post<CuotaDetalle>(this.apiUrl, request);
  }

  actualizar(id: number, request: CuotaRequest): Observable<CuotaDetalle> {
    return this.http.put<CuotaDetalle>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  pagar(id: number): Observable<CuotaDetalle> {
    return this.http.put<CuotaDetalle>(`${this.apiUrl}/${id}/pagar`, {});
  }

  anular(id: number): Observable<CuotaDetalle> {
    return this.http.put<CuotaDetalle>(`${this.apiUrl}/${id}/anular`, {});
  }

  deshacerPago(id: number): Observable<CuotaDetalle> {
    return this.http.put<CuotaDetalle>(`${this.apiUrl}/${id}/deshacerPago`, {});
  }

  generarCuotas(anio: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/generar/${anio}`,
      {},
      {
        responseType: 'text',
      },
    );
  }

  obtenerAnios(): Observable<number[]> {
    return this.http.get<number[]>(`${environment.apiUrl}/cuotas/anios`);
  }

  exportarExcel(texto = '', estado?: string, anio?: number, tipo?: TipoSocio, cuadrilla?: string): Observable<Blob> {
    let params = new HttpParams();
    if (texto.trim()) params = params.set('texto', texto);
    if (estado) params = params.set('estado', estado);
    if (anio) params = params.set('anio', anio);
    if (tipo) params = params.set('tipo', tipo);
    if (cuadrilla) params = params.set('cuadrilla', cuadrilla);
    return this.http.get(`${this.apiUrl}/exportar-excel`, { params, responseType: 'blob' });
  }
}
