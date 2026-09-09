import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CuotaDetalle } from '../../../core/models/cuotas/cuota-detalle';
import { FormBuilder, Validators } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-editar-cuota',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dialog-editar.html',
  styleUrls: ['./dialog-editar.css'],
})
export class DialogEditarCuotaComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogEditarCuotaComponent>);

  readonly cuota = inject<CuotaDetalle>(MAT_DIALOG_DATA);

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    importe: [this.cuota.importe, [Validators.required, Validators.min(0.01)]],
    observaciones: [this.cuota.observaciones ?? ''],
  });

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close(this.form.value);
  }
}


