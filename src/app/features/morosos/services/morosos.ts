import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Moroso } from '../models/moroso';

@Injectable({
  providedIn: 'root',
})
export class MorososService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/cuotas`;

  obtenerMorosos(anio?: number): Observable<Moroso[]> {
    if (anio === undefined) {
      return this.http.get<Moroso[]>(`${this.apiUrl}/morosos`);
    }

    return this.http.get<Moroso[]>(`${this.apiUrl}/morosos?anio=${anio}`);
  }

  anularCuotasAntiguas(): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/anular-antiguas`, {});
  }
}
