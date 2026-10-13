import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MovimientoTesoreria, MovimientoTesoreriaRequest, TipoMovimientoTesoreria } from '../../../core/models/tesoreria/tesoreria';

@Component({
  selector: 'app-dialog-movimiento-tesoreria', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './dialog-movimiento.html', styleUrl: './dialog-movimiento.css',
})
export class DialogMovimientoTesoreriaComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogMovimientoTesoreriaComponent>);
  private readonly fb = inject(FormBuilder);
  readonly movimiento = inject<MovimientoTesoreria | null>(MAT_DIALOG_DATA, { optional: true }) ?? null;
  readonly esEdicion = !!this.movimiento;
  readonly tipos: { valor: TipoMovimientoTesoreria; texto: string }[] = [{ valor: 'INGRESO', texto: 'Ingreso' }, { valor: 'GASTO', texto: 'Gasto' }];
  form = this.fb.group({
    fecha: [this.movimiento?.fecha ?? new Date().toISOString().slice(0, 10), Validators.required],
    concepto: [this.movimiento?.concepto ?? '', [Validators.required, Validators.maxLength(200)]],
    categoria: [this.movimiento?.categoria ?? '', [Validators.required, Validators.maxLength(100)]],
    tipo: [this.movimiento?.tipo ?? 'INGRESO' as TipoMovimientoTesoreria, Validators.required],
    importe: [this.movimiento?.importe ?? null as number | null, [Validators.required, Validators.min(0.01)]],
    formaPago: [this.movimiento?.formaPago ?? 'Transferencia'],
    observaciones: [this.movimiento?.observaciones ?? ''],
  });

  cancelar(): void { this.dialogRef.close(); }
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.getRawValue() as MovimientoTesoreriaRequest);
  }
}
