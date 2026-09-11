import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracion } from '../models/configuracion/configuracion';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  obtener(): Observable<Configuracion> {
    return this.http.get<Configuracion>(this.apiUrl);
  }

  actualizar(configuracion: Configuracion): Observable<Configuracion> {
    return this.http.put<Configuracion>(this.apiUrl, configuracion);
  }
}
