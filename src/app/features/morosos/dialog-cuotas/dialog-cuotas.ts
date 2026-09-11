import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';


import { CuotaService } from '../../../core/services/cuota';
import { Cuota } from '../../../core/models/cuotas/cuota';
import { Moroso } from '../models/moroso';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmarPagoComponent } from '../dialog-confirmar-pago/dialog-confirmar-pago';

import { NotificationService } from '../../../shared/services/notification';


@Component({
  selector: 'app-dialog-cuotas',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './dialog-cuotas.html',
  styleUrl: './dialog-cuotas.css',
})
export class DialogCuotasComponent implements OnInit {
  private readonly cuotaService = inject(CuotaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly dialogRef = inject(MatDialogRef<DialogCuotasComponent>);

  cuotas: Cuota[] = [];
  cambiosRealizados = false;

  displayedColumns = ['anio', 'importe', 'estado', 'acciones'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Moroso,
  ) {}

  ngOnInit(): void {
    this.cuotaService.obtenerPorHermano(this.data.hermanoId).subscribe({
      next: (cuotas) => {
        this.cuotas = cuotas.filter((cuota) => cuota.estado === 'PENDIENTE');

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al cargar las cuotas del hermano:', error);
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(this.cambiosRealizados);
  }

  totalPendiente(): number {
    return this.cuotas.reduce((total, cuota) => total + cuota.importe, 0);
  }

  pagar(cuota: Cuota): void {
    if (!cuota.id) {
      return;
    }

    const dialogRef = this.dialog.open(DialogConfirmarPagoComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: cuota,
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.cuotaService.pagar(cuota.id).subscribe({
        next: () => {
          this.cuotas = this.cuotas.filter((c) => c.id !== cuota.id);

          this.cambiosRealizados = true;

          this.notificationService.success('Cuota marcada como pagada');

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al pagar la cuota:', error);

          this.notificationService.httpError(error);
        },
      });
    });
  }
}
