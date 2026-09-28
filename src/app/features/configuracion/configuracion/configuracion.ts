import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ConfiguracionService } from '../../../core/services/configuracion';
import { NotificationService } from '../../../shared/services/notification';
import { Configuracion, ConfiguracionCuadrilla } from '../../../core/models/configuracion/configuracion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css'],
})
export class ConfiguracionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly notificationService = inject(NotificationService);
  cuadrillasConfiguracion: ConfiguracionCuadrilla[] = [];

  form = this.fb.group({
    nombreHermandad: ['', [Validators.required, Validators.maxLength(200)]],

    cif: ['', [Validators.maxLength(20)]],

    direccion: ['', [Validators.maxLength(255)]],

    telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],

    email: ['', [Validators.email]],

    importeCuotaHermano: [0, [Validators.required, Validators.min(0.01)]],

    importeCuotaCostalero: [0, [Validators.required, Validators.min(0.01)]],

    anioActivo: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(2000), Validators.max(2100)],
    ],

    iban: ['', [Validators.pattern(/^ES\d{22}$/)]],
  });

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  private cargarConfiguracion(): void {
    this.configuracionService.obtener().subscribe({
      next: (configuracion: Configuracion) => {
        this.form.patchValue(configuracion);
        this.cuadrillasConfiguracion = (configuracion.cuadrillas ?? []).map(cuadrilla => ({ ...cuadrilla }));
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.configuracionService.actualizar({ ...this.form.getRawValue(), cuadrillas: this.cuadrillasConfiguracion } as Configuracion).subscribe({
      next: configuracion => {
        this.cuadrillasConfiguracion = configuracion.cuadrillas.map(cuadrilla => ({ ...cuadrilla }));
        this.notificationService.success('La configuración se ha actualizado correctamente.');
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  guardarCuadrillas(): void {
    const cuadrillas = this.cuadrillasConfiguracion.map(cuadrilla => ({
      nombre: cuadrilla.nombre,
      filas: Number(cuadrilla.filas),
      columnas: Number(cuadrilla.columnas),
    }));
    this.configuracionService.actualizarCuadrillas(cuadrillas).subscribe({
      next: respuesta => {
        this.cuadrillasConfiguracion = respuesta.map(cuadrilla => ({ ...cuadrilla }));
        this.notificationService.success('Configuración de cuadrillas guardada correctamente.');
      },
      error: error => this.notificationService.httpError(error),
    });
  }

  convertirIbanMayusculas(): void {
    const iban = this.form.controls.iban.value;

    if (!iban) {
      return;
    }

    this.form.controls.iban.setValue(iban.toUpperCase(), {
      emitEvent: false,
    });
  }
}
