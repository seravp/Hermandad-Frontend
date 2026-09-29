import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, afterEach, it, expect } from 'vitest';
import { AuthService } from './auth';

beforeEach(() => { localStorage.clear(); TestBed.configureTestingModule({ providers: [provideHttpClient()] }); });
afterEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });

it('muestra el username de login aunque el subject sea un ID', () => {
  const service = TestBed.inject(AuthService);
  service.guardarSesion({ token: `header.${btoa(JSON.stringify({ sub: '1' }))}.signature`, rol: 'ADMIN', username: 'admin' });
  expect(service.obtenerNombreUsuario()).toBe('admin');
  expect(TestBed.inject(AuthService).obtenerNombreUsuario()).toBe('admin');
  service.logout();
  expect(service.obtenerNombreUsuario()).toBe('Usuario');
  expect(localStorage.getItem('username')).toBeNull();
});

it('no muestra el ID en sesiones anteriores sin nombre guardado', () => {
  localStorage.setItem('token', `header.${btoa(JSON.stringify({ sub: '1' }))}.signature`);
  expect(TestBed.inject(AuthService).obtenerNombreUsuario()).toBe('Usuario');
});

it('conserva nombres Unicode y sustituye el nombre al cambiar de cuenta', () => {
  const service = TestBed.inject(AuthService);
  service.guardarSesion({ token: 'token', rol: 'ADMIN', username: 'José' });
  expect(service.obtenerNombreUsuario()).toBe('José');
  service.guardarSesion({ token: 'other-token', rol: 'CONSULTA', username: 'prueba' });
  expect(service.obtenerNombreUsuario()).toBe('prueba');
});