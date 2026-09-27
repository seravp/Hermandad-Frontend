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

import { Hermano } from '../../../core/models/hermanos/hermano';
import { HermanoService } from '../../../core/services/hermano';
import { CuotaRequest } from '../../hermanos/models/cuota-request';

interface DatosInicialesCuota {
  anio: number;
  importe: number;
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
  private readonly hermanoService = inject(HermanoService);
  private readonly dialogRef = inject(MatDialogRef<DialogCrearCuotaComponent>);

  buscandoHermanos = false;
  busquedaRealizada = false;

  readonly datosIniciales = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as DatosInicialesCuota | null;

  readonly busquedaHermanoControl = new FormControl<string | Hermano>('');

  hermanos: Hermano[] = [];

  form = this.fb.group({
    hermanoId: [0, [Validators.required, Validators.min(1)]],
    anio: [
      this.datosIniciales?.anio ?? new Date().getFullYear(),
      [Validators.required, Validators.min(2000)],
    ],

    importe: [this.datosIniciales?.importe ?? 0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
  });

  constructor() {
    this.busquedaHermanoControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => this.buscarHermanos(valor));
  }

  seleccionarHermano(hermano: Hermano): void {
    this.form.controls.hermanoId.setValue(hermano.id);
  }

  mostrarHermano(hermano: Hermano | null): string {
    if (!hermano) {
      return '';
    }

    return `Nº ${hermano.numeroHermano} — ${hermano.nombre} ${hermano.apellidos}`;
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
      hermanoId: this.form.controls.hermanoId.value,
      anio: this.form.controls.anio.value,
      importe: this.form.controls.importe.value,
      observaciones: this.form.controls.observaciones.value || null,
    };

    this.dialogRef.close(request);
  }

  private buscarHermanos(valor: string | Hermano | null): void {
    const texto = typeof valor === 'string' ? valor.trim() : '';

    if (!texto) {
      this.hermanos = [];
      this.buscandoHermanos = false;
      this.busquedaRealizada = false;
      return;
    }

    this.form.controls.hermanoId.setValue(0);
    this.buscandoHermanos = true;
    this.busquedaRealizada = false;

    this.hermanoService.buscar(texto, 'ACTIVO', 0, 10).subscribe({
      next: (respuesta) => {
        this.hermanos = respuesta.content;
        this.buscandoHermanos = false;
        this.busquedaRealizada = true;
      },
      error: () => {
        this.hermanos = [];
        this.buscandoHermanos = false;
        this.busquedaRealizada = true;
      },
    });
  }
}
