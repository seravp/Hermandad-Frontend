import { Component, inject, OnInit } from '@angular/core';

import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { SocioService } from '../../../core/services/socio';
import { SocioRequest } from '../models/socio-request';
import { EstadoSocio } from '../../../core/models/estados/estado-socio';
import { FormaPago } from '../models/forma-pago';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../../shared/services/notification';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocioDetalle } from '../../../core/models/socios/socio-detalle';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';


@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class FormularioComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private socioService = inject(SocioService);
  private notificationService = inject(NotificationService);

  private dialogRef = inject(MatDialogRef<FormularioComponent>);

  readonly EstadoSocio = EstadoSocio;
  readonly FormaPago = FormaPago;
  readonly TipoSocio = TipoSocio;
  readonly cuadrillas = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];
  readonly socio = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as SocioDetalle | null;

  readonly esEdicion = this.socio !== null;

  maxFechaNacimiento = new Date();

  form = this.fb.group({
    nombre: ['', Validators.required],

    apellidos: ['', Validators.required],

    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]],

    fechaNacimiento: this.fb.control<Date | null>(null),

    telefono: ['', Validators.pattern(/^\+?[0-9]{9,15}$/)],

    email: ['', Validators.email],

    direccion: [''],

    estado: [EstadoSocio.ACTIVO, Validators.required],

    tipo: [TipoSocio.HERMANO, Validators.required],

    cuadrilla: [''],

    formaPago: [FormaPago.DOMICILIACION, Validators.required],

    iban: ['', Validators.pattern(/^ES\d{22}$/)],

    titularCuenta: [''],
  });

  ngOnInit(): void {
    if (this.esEdicion && this.socio) {
      this.form.patchValue({
        nombre: this.socio.nombre,
        apellidos: this.socio.apellidos,
        dni: this.socio.dni,
        telefono: this.socio.telefono,
        email: this.socio.email,
        direccion: this.socio.direccion,
        fechaNacimiento: this.socio.fechaNacimiento
          ? this.parseLocalDate(this.socio.fechaNacimiento)
          : null,
        estado: this.socio.estado,
        tipo: this.socio.tipo,
        cuadrilla: this.socio.cuadrilla ?? '',
        formaPago: this.socio.formaPago,
        iban: this.socio.iban ?? '',
        titularCuenta: this.socio.titularCuenta ?? '',
      });
    }
    this.actualizarValidacionesFormaPago(this.form.get('formaPago')?.value);

    this.formaPagoChange();
  }

  private formaPagoChange(): void {
    this.form.get('formaPago')?.valueChanges.subscribe((valor) => {
      this.actualizarValidacionesFormaPago(valor);
    });
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseLocalDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private actualizarValidacionesFormaPago(valor: string | null | undefined): void {
    const iban = this.form.get('iban');
    const titular = this.form.get('titularCuenta');

    if (valor === 'DOMICILIACION') {
      iban?.setValidators([Validators.required, Validators.pattern(/^ES\d{22}$/)]);
      titular?.setValidators([Validators.required]);
    } else {
      iban?.clearValidators();
      titular?.clearValidators();

      iban?.setValue('');
      titular?.setValue('');
    }

    iban?.updateValueAndValidity();
    titular?.updateValueAndValidity();
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.crearRequest();

    if (this.esEdicion) {
      this.actualizar(request);
    } else {
      this.crear(request);
    }
  }

  private crear(request: SocioRequest): void {
    this.socioService.crear(request).subscribe({
      next: () => {
        this.notificationService.success('Socio creado correctamente.');
        this.dialogRef.close(true);
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  private actualizar(request: SocioRequest): void {
    this.socioService.actualizar(this.socio!.id, request).subscribe({
      next: () => {
        this.notificationService.success('Socio actualizado correctamente.');
        this.dialogRef.close(true);
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  private crearRequest(): SocioRequest {
    const fechaNacimiento = this.form.controls.fechaNacimiento.value;

    return {
      nombre: this.form.controls.nombre.value,
      apellidos: this.form.controls.apellidos.value,
      dni: this.form.controls.dni.value,
      telefono: this.form.controls.telefono.value,
      email: this.form.controls.email.value,
      direccion: this.form.controls.direccion.value,
      estado: this.form.controls.estado.value,
      tipo: this.form.controls.tipo.value,
      cuadrilla: this.form.controls.cuadrilla.value || null,
      formaPago: this.form.controls.formaPago.value,
      iban: this.form.controls.iban.value,
      titularCuenta: this.form.controls.titularCuenta.value,
      fechaNacimiento: fechaNacimiento ? this.formatLocalDate(fechaNacimiento) : null,
    };
  }

  convertirDniMayusculas(): void {
    const control = this.form.get('dni');

    if (!control?.value) {
      return;
    }

    control.setValue(control.value.toUpperCase(), {
      emitEvent: false,
    });
  }
}
