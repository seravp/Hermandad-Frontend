import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { Auditoria } from '../models/auditoria/auditoria';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auditoria`;

  buscar(
    usuario: string,
    accion: string,
    entidad: string,
    page: number,
    size: number,
  ): Observable<Page<Auditoria>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (usuario.trim()) {
      params = params.set('usuario', usuario.trim());
    }

    if (accion.trim()) {
      params = params.set('accion', accion.trim());
    }

    if (entidad.trim()) {
      params = params.set('entidad', entidad.trim());
    }

    return this.http.get<Page<Auditoria>>(this.apiUrl, { params });
  }
}
