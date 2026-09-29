import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UsuarioService } from '../../../core/services/usuario';
import { RolUsuario, Usuario } from '../../../core/models/usuarios/usuario';
import { UsuarioRequest } from '../../../core/models/usuarios/usuario-request';
import { NotificationService } from '../../../shared/services/notification';

export const passwordPolicy: ValidatorFn = (control) => {
  const value = control.value as string;
  if (!value) return null; // Required only when creating an account.
  return value.trim().length > 0 && Array.from(value).length >= 12 &&
    new TextEncoder().encode(value).length <= 72 ? null : { passwordPolicy: true };
};

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class FormularioUsuarioComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<FormularioUsuarioComponent>);

  readonly usuario = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as Usuario | null;

  readonly esEdicion = this.usuario !== null;

  readonly roles: RolUsuario[] = ['ADMIN', 'TESORERO', 'SECRETARIO', 'CONSULTA'];

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, passwordPolicy]],
    rol: ['CONSULTA' as RolUsuario, Validators.required],
    activo: [true, Validators.required],
  });

  ngOnInit(): void {
    if (!this.esEdicion || !this.usuario) {
      return;
    }

    this.form.controls.password.setValidators(passwordPolicy);
    this.form.controls.password.updateValueAndValidity();

    this.form.patchValue({
      username: this.usuario.username,
      rol: this.usuario.rol,
      activo: this.usuario.activo,
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: UsuarioRequest = {
      username: this.form.controls.username.value,
      rol: this.form.controls.rol.value,
      activo: this.form.controls.activo.value,
    };

    if (this.form.controls.password.value) {
      request.password = this.form.controls.password.value;
    }

    if (!this.esEdicion) {
      request.password = this.form.controls.password.value;
      this.crear(request);
      return;
    }

    this.actualizar(request);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private crear(request: UsuarioRequest): void {
    this.usuarioService.crear(request).subscribe({
      next: () => {
        this.notificationService.success('Usuario creado correctamente.');
        this.dialogRef.close(true);
      },
      error: (error) => this.notificationService.httpError(error),
    });
  }

  private actualizar(request: UsuarioRequest): void {
    this.usuarioService.actualizar(this.usuario!.id, request).subscribe({
      next: () => {
        this.notificationService.success(request.password
          ? 'Usuario y contraseña actualizados. Debe iniciar sesión de nuevo.'
          : 'Usuario actualizado correctamente.');
        this.dialogRef.close(true);
      },
      error: (error) => this.notificationService.httpError(error),
    });
  }
}