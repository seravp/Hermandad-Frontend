import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracion, ConfiguracionCuadrilla, ConfiguracionCuotas } from '../models/configuracion/configuracion';
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

  obtenerConfiguracionCuotas(): Observable<ConfiguracionCuotas> {
    return this.http.get<ConfiguracionCuotas>(`${this.apiUrl}/cuotas`);
  }

  obtenerCuadrilla(nombre: string): Observable<ConfiguracionCuadrilla> {
    return this.http.get<ConfiguracionCuadrilla>(`${this.apiUrl}/cuadrillas/${encodeURIComponent(nombre)}`);
  }

  actualizarCuadrillas(cuadrillas: ConfiguracionCuadrilla[]): Observable<ConfiguracionCuadrilla[]> {
    return this.http.put<ConfiguracionCuadrilla[]>(`${this.apiUrl}/cuadrillas`, cuadrillas);
  }
}
