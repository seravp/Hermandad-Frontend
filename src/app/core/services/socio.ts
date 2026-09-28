import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Socio } from '../models/socios/socio';
import { Page } from '../models/page';
import { SocioRequest } from '../../features/socios/models/socio-request';
import { SocioResponse } from '../../features/socios/models/socio-response';
import { SocioDetalle } from '../models/socios/socio-detalle';
import { TipoSocio } from '../models/socios/tipo-socio';

export interface ImportacionSociosResultado {
  importados: number;
  omitidos: number;
  errores: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SocioService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/socios`;

  crear(request: SocioRequest) {
    return this.http.post<SocioResponse>(this.apiUrl, request);
  }

  buscar(
    texto: string = '',
    estado?: string,
    tipo?: TipoSocio,
    cuadrilla?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'numeroSocio',
    direction: string = 'asc',
  ): Observable<Page<Socio>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort)
      .set('direction', direction);

    if (texto.trim()) {
      params = params.set('texto', texto);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    if (cuadrilla) {
      params = params.set('cuadrilla', cuadrilla);
    }

    return this.http.get<Page<Socio>>(`${environment.apiUrl}/socios/busqueda-paginada`, {
      params,
    });
  }

  obtenerPorId(id: number): Observable<SocioDetalle> {
    return this.http.get<SocioDetalle>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, request: SocioRequest): Observable<SocioDetalle> {
    return this.http.put<SocioDetalle>(`${this.apiUrl}/${id}`, request);
  }

  asignarPosicionCuadrilla(id: number, posicion: number): Observable<SocioDetalle> {
    return this.http.put<SocioDetalle>(`${this.apiUrl}/${id}/posicion-cuadrilla`, { posicion });
  }

  liberarPosicionCuadrilla(id: number): Observable<SocioDetalle> {
    return this.http.delete<SocioDetalle>(`${this.apiUrl}/${id}/posicion-cuadrilla`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportarExcel(texto = '', estado?: string, tipo?: TipoSocio, cuadrilla?: string): Observable<Blob> {
    let params = new HttpParams();
    if (texto.trim()) params = params.set('texto', texto);
    if (estado) params = params.set('estado', estado);
    if (tipo) params = params.set('tipo', tipo);
    if (cuadrilla) params = params.set('cuadrilla', cuadrilla);
    return this.http.get(`${this.apiUrl}/exportar-excel`, { params, responseType: 'blob' });
  }

  importarExcel(archivo: File): Observable<ImportacionSociosResultado> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<ImportacionSociosResultado>(`${this.apiUrl}/importar-excel`, datos);
  }

  descargarPlantillaImportacion(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/importar-excel/plantilla`, { responseType: 'blob' });
  }
}
