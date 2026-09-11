import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuotaService } from '../../../core/services/cuota';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Moroso } from '../models/moroso';
import { MorososService } from '../services/morosos';
import { ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { DialogCuotasComponent } from '../dialog-cuotas/dialog-cuotas';

import { InformeService } from '../../../core/services/informe';
import { NotificationService } from '../../../shared/services/notification';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoComponent implements OnInit {
  private readonly morososService = inject(MorososService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly cuotaService = inject(CuotaService);
  private readonly informeService = inject(InformeService);
  private readonly notificationService = inject(NotificationService);

  morosos: Moroso[] = [];
  morososFiltrados: Moroso[] = [];
  anios: number[] = [];
  anioSeleccionado: number | undefined;

  textoBusqueda = '';

  displayedColumns = [
    'numeroHermano',
    'nombreCompleto',
    'cuotasPendientes',
    'importePendiente',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarAnios();
    this.cargarMorosos();
  }

  cargarMorosos(): void {
    this.morososService.obtenerMorosos(this.anioSeleccionado).subscribe({
      next: (morosos) => {
        this.morosos = morosos;
        this.morososFiltrados = morosos;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al cargar morosos:', error);
      },
    });
  }

  cambiarAnio(): void {
    this.cargarMorosos();
  }

  buscar(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.morososFiltrados = this.morosos;

      return;
    }

    this.morososFiltrados = this.morosos.filter(
      (moroso) =>
        moroso.numeroHermano.toString().includes(texto) ||
        moroso.nombreCompleto.toLowerCase().includes(texto),
    );
  }

  totalImportePendiente(): number {
    return this.morososFiltrados.reduce((total, moroso) => total + moroso.importePendiente, 0);
  }

  totalCuotasPendientes(): number {
    return this.morososFiltrados.reduce((total, moroso) => total + moroso.cuotasPendientes, 0);
  }

  verCuotas(moroso: Moroso): void {
    const dialogRef = this.dialog.open(DialogCuotasComponent, {
      width: '650px',
      maxWidth: '95vw',
      data: moroso,
    });

    dialogRef.afterClosed().subscribe((cambiosRealizados) => {
      if (cambiosRealizados) {
        this.cargarMorosos();
      }
    });
  }
  cargarAnios(): void {
    this.cuotaService.obtenerAnios().subscribe({
      next: (anios) => {
        this.anios = anios;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al cargar los años:', error);
      },
    });
  }

  generarCarta(moroso: Moroso): void {
    this.informeService.generarCartaMoroso(moroso.hermanoId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        this.notificationService.success('Aviso de morosidad generado correctamente');
      },

      error: (error) => {
        console.error('Error al generar la carta de morosidad:', error);

        this.notificationService.httpError(error);
      },
    });
  }
}
