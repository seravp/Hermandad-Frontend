import { Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Socio } from '../../../core/models/socios/socio';
import { SocioService } from '../../../core/services/socio';
import { CuotaRequest } from '../../socios/models/cuota-request';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';

interface DatosInicialesCuota {
  anio: number;
  importeCuotaHermano: number;
  importeCuotaCostalero: number;
  tipoPermitido?: TipoSocio;
}

@Component({
  selector: 'app-dialog-crear-cuota',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './dialog-crear.html',
  styleUrl: './dialog-crear.css',
})
export class DialogCrearCuotaComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly socioService = inject(SocioService);
  private readonly dialogRef = inject(MatDialogRef<DialogCrearCuotaComponent>);

  buscandoSocios = false;
  busquedaRealizada = false;

  readonly datosIniciales = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as DatosInicialesCuota | null;

  readonly busquedaSocioControl = new FormControl<string | Socio>('');

  socios: Socio[] = [];

  form = this.fb.group({
    socioId: [0, [Validators.required, Validators.min(1)]],
    anio: [
      this.datosIniciales?.anio ?? new Date().getFullYear(),
      [Validators.required, Validators.min(2000)],
    ],

    importe: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
  });

  constructor() {
    this.busquedaSocioControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => this.buscarSocios(valor));
  }

  seleccionarSocio(socio: Socio): void {
    this.form.controls.socioId.setValue(socio.id);
    this.form.controls.importe.setValue(
      socio.tipo === 'HERMANO'
        ? this.datosIniciales?.importeCuotaHermano ?? 0
        : this.datosIniciales?.importeCuotaCostalero ?? 0,
    );
  }

  mostrarSocio(socio: Socio | null): string {
    if (!socio) {
      return '';
    }

    return `Nº ${socio.numeroSocio} — ${socio.nombre} ${socio.apellidos}`;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: CuotaRequest = {
      socioId: this.form.controls.socioId.value,
      anio: this.form.controls.anio.value,
      importe: this.form.controls.importe.value,
      observaciones: this.form.controls.observaciones.value || null,
    };

    this.dialogRef.close(request);
  }

  private buscarSocios(valor: string | Socio | null): void {
    const texto = typeof valor === 'string' ? valor.trim() : '';

    if (!texto) {
      this.socios = [];
      this.buscandoSocios = false;
      this.busquedaRealizada = false;
      return;
    }

    this.form.controls.socioId.setValue(0);
    this.buscandoSocios = true;
    this.busquedaRealizada = false;

    this.socioService.buscar(texto, 'ACTIVO', this.datosIniciales?.tipoPermitido, undefined, 0, 10).subscribe({
      next: (respuesta) => {
        this.socios = respuesta.content;
        this.buscandoSocios = false;
        this.busquedaRealizada = true;
      },
      error: () => {
        this.socios = [];
        this.buscandoSocios = false;
        this.busquedaRealizada = true;
      },
    });
  }
}
