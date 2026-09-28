import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { LoginRequest } from '../models/auth/login-request';
import { LoginResponse } from '../models/auth/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request);
  }

  guardarSesion(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('rol', response.rol);
  }

  obtenerRol(): string | null {
    return localStorage.getItem('rol');
  }

  esAdmin(): boolean {
    return this.obtenerRol() === 'ADMIN';
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerNombreUsuario(): string {
    const token = this.obtenerToken();

    if (!token) {
      return 'Usuario';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.sub === 'string' && payload.sub.trim()
        ? payload.sub
        : 'Usuario';
    } catch {
      return 'Usuario';
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();

    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const noHaCaducado = typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();

      if (!noHaCaducado) {
        this.logout();
      }

      return noHaCaducado;
    } catch {
      this.logout();
      return false;
    }
  }

  puedeGenerarInformes(): boolean {
    const rol = this.obtenerRol();

    return rol === 'ADMIN' || rol === 'TESORERO';
  }

  puedeGestionarCuotas(): boolean {
    const rol = this.obtenerRol();
    return rol === 'ADMIN' || rol === 'TESORERO' || rol === 'SECRETARIO';
  }

  puedeConsultarCuotas(): boolean {
    const rol = this.obtenerRol();

    return rol === 'ADMIN' || rol === 'TESORERO' || rol === 'SECRETARIO';
  }

  puedeConsultarInventario(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO', 'CONSULTA'].includes(this.obtenerRol() ?? '');
  }

  puedeGestionarSocios(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeGestionarCuadrillas(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeGestionarInventario(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeGestionarRevisionesInventario(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeVerTesoreria(): boolean {
    return ['ADMIN', 'SECRETARIO', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeAccederMorosos(): boolean {
    return ['ADMIN', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeGenerarCuotas(): boolean {
    return ['ADMIN', 'TESORERO'].includes(this.obtenerRol() ?? '');
  }

  puedeGestionarTipoCuota(tipo: string): boolean {
    return this.puedeGenerarCuotas() || (this.obtenerRol() === 'SECRETARIO' && tipo === 'COSTALERO');
  }
}
