import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Hermano } from '../models/hermano';
import { Page } from '../models/page';
import { HermanoRequest } from '../../features/hermanos/models/hermano-request';
import { HermanoResponse } from '../../features/hermanos/models/hermano-response';
import { HermanoDetalle } from '../models/hermano-detalle';

@Injectable({
  providedIn: 'root',
})
export class HermanoService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/hermanos`;

  crear(request: HermanoRequest) {
    return this.http.post<HermanoResponse>(this.apiUrl, request);
  }

  buscar(
    texto: string = '',
    estado?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'numeroHermano',
    direction: string = 'asc',
  ): Observable<Page<Hermano>> {
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

    return this.http.get<Page<Hermano>>(`${environment.apiUrl}/hermanos/busqueda-paginada`, {
      params,
    });
  }

  obtenerPorId(id: number): Observable<HermanoDetalle> {
    return this.http.get<HermanoDetalle>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, request: HermanoRequest): Observable<HermanoDetalle> {
    return this.http.put<HermanoDetalle>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
