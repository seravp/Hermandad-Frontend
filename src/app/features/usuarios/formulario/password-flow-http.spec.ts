import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioUsuarioComponent } from './formulario';
import { NotificationService } from '../../../shared/services/notification';
import { environment } from '../../../../environments/environment';

describe('Editar contraseña desde el formulario hasta HTTP', () => {
  const notification = { success: vi.fn(), httpError: vi.fn() };
  const close = vi.fn();
  let http: HttpTestingController;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FormularioUsuarioComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 7, username: 'prueba', rol: 'CONSULTA', activo: true } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('escribe una contraseña, pulsa Actualizar y envía password sin eliminarlo', () => {
    const fixture = TestBed.createComponent(FormularioUsuarioComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[formControlName="password"]') as HTMLInputElement;
    input.value = 'Nueva-clave-prueba-2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    button.click();
    const request = http.expectOne(`${environment.apiUrl}/usuarios/7`);
    expect(request.request.method).toBe('PUT');
    expect(JSON.parse(request.request.serializeBody() as string)).toEqual({
      username: 'prueba', rol: 'CONSULTA', activo: true, password: 'Nueva-clave-prueba-2026',
    });
    expect(notification.success).not.toHaveBeenCalled();
    request.flush({ id: 7, username: 'prueba', rol: 'CONSULTA', activo: true });
    expect(notification.success).toHaveBeenCalledWith('Usuario y contraseña actualizados. Debe iniciar sesión de nuevo.');
    expect(close).toHaveBeenCalledWith(true);
  });

  it('omite password si el campo opcional se deja vacío', () => {
    const fixture = TestBed.createComponent(FormularioUsuarioComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement).click();
    const request = http.expectOne(`${environment.apiUrl}/usuarios/7`);
    expect(request.request.body).toEqual({ username: 'prueba', rol: 'CONSULTA', activo: true });
    request.flush({ id: 7, username: 'prueba', rol: 'CONSULTA', activo: true });
    expect(notification.success).toHaveBeenCalledWith('Usuario actualizado correctamente.');
  });
});
