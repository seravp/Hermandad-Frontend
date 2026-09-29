import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioUsuarioComponent } from './formulario';
import { UsuarioService } from '../../../core/services/usuario';
import { NotificationService } from '../../../shared/services/notification';

describe('Formulario de usuarios', () => {
  const api = { crear: vi.fn(), actualizar: vi.fn(), cambiarPassword: vi.fn() };
  const close = vi.fn();
  const notification = { success: vi.fn(), httpError: vi.fn() };

  beforeEach(() => { vi.resetAllMocks(); TestBed.resetTestingModule(); });

  function setup(edit: boolean) {
    TestBed.configureTestingModule({
      imports: [FormularioUsuarioComponent],
      providers: [
        { provide: UsuarioService, useValue: api },
        { provide: NotificationService, useValue: notification },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: edit
          ? { id: 7, username: 'consulta', rol: 'CONSULTA', activo: true } : null },
      ],
    });
    const fixture = TestBed.createComponent(FormularioUsuarioComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('envía la contraseña nueva junto con la edición en una única petición', () => {
    const component = setup(true);
    api.actualizar.mockReturnValue(of({}));
    component.form.controls.password.setValue('Una-clave-segura-2026');
    component.guardar();
    expect(api.actualizar).toHaveBeenCalledWith(7, {
      username: 'consulta', rol: 'CONSULTA', activo: true, password: 'Una-clave-segura-2026',
    });
    expect(api.cambiarPassword).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(true);
  });

  it('omite la contraseña al editar sin cambiarla', () => {
    const component = setup(true);
    api.actualizar.mockReturnValue(of({}));
    component.guardar();
    expect(api.actualizar).toHaveBeenCalledWith(7, {
      username: 'consulta', rol: 'CONSULTA', activo: true,
    });
  });

  it('bloquea contraseñas cortas, en blanco y con exceso de bytes', () => {
    const component = setup(true);
    for (const password of ['corta', ' '.repeat(12), 'é'.repeat(37)]) {
      component.form.controls.password.setValue(password);
      component.guardar();
      expect(component.form.invalid).toBe(true);
    }
    expect(api.actualizar).not.toHaveBeenCalled();
  });

  it('exige contraseña al crear y envía la válida', () => {
    const component = setup(false);
    component.form.controls.username.setValue('nuevo');
    component.guardar();
    expect(api.crear).not.toHaveBeenCalled();
    component.form.controls.password.setValue('Una-clave-segura-2026');
    api.crear.mockReturnValue(of({}));
    component.guardar();
    expect(api.crear).toHaveBeenCalledWith(expect.objectContaining({ password: 'Una-clave-segura-2026' }));
  });

  it('mantiene abierto el formulario si el servidor rechaza los cambios', () => {
    const component = setup(true);
    const error = { status: 409 };
    api.actualizar.mockReturnValue(throwError(() => error));
    component.guardar();
    expect(notification.httpError).toHaveBeenCalledWith(error);
    expect(close).not.toHaveBeenCalled();
  });
});
