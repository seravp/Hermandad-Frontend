import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Cuota } from '../../../core/models/cuotas/cuota';


@Component({
  selector: 'app-dialog-confirmar-pago',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog-confirmar-pago.html',
  styleUrl: './dialog-confirmar-pago.css',
})
export class DialogConfirmarPagoComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Cuota,

    private readonly dialogRef: MatDialogRef<DialogConfirmarPagoComponent>,
  ) {}

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
