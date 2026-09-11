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

  private readonly apiUrl = `${environment.apiUrl}/cuotas/morosos`;

  obtenerMorosos(anio?: number): Observable<Moroso[]> {
    if (anio === undefined) {
      return this.http.get<Moroso[]>(this.apiUrl);
    }

    return this.http.get<Moroso[]>(`${this.apiUrl}?anio=${anio}`);
  }
}
