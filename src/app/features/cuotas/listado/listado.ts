import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

import { CuotaService } from '../../../core/services/cuota';
import { Cuota } from '../../../core/models/cuotas/cuota';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { AfterViewInit } from '@angular/core';
import { NotificationService } from '../../../shared/services/notification';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-listado-cuotas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoComponent implements OnInit, AfterViewInit {
  private cuotaService = inject(CuotaService);
  private readonly notificationService = inject(NotificationService);
  anios: number[] = [];

  dataSource = new MatTableDataSource<Cuota>();

  @ViewChild(MatSort)
  sortTable!: MatSort;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  textoBusqueda = '';

  estadoSeleccionado = '';

  anioSeleccionado?: number;

  page = 0;

  pageSize = 10;

  totalElements = 0;

  sort = 'anio';

  direction = 'asc';

  busquedaControl = new FormControl('');

  displayedColumns = [
    'numeroHermano',
    'nombreHermano',
    'anio',
    'importe',
    'estado',
    'fechaPago',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarCuotas();

    this.cuotaService.obtenerAnios().subscribe({
      next: (anios) => {
        this.anios = anios;
      },
      error: (error) => this.notificationService.httpError(error),
    });

    this.busquedaControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => {
        this.textoBusqueda = valor ?? '';

        this.page = 0;

        this.cargarCuotas();
      });
  }

  cambiarPagina(event: PageEvent): void {
    this.page = event.pageIndex;

    this.pageSize = event.pageSize;

    this.cargarCuotas();
  }

  ordenar(sort: Sort): void {
    this.sort = sort.active;

    this.direction = sort.direction || 'asc';

    this.cargarCuotas();
  }

  private cargarCuotas(): void {
    this.cuotaService
      .buscar(
        this.textoBusqueda,
        this.estadoSeleccionado || undefined,
        this.anioSeleccionado,
        this.page,
        this.pageSize,
        this.sort,
        this.direction,
      )
      .subscribe({
        next: (page) => {
          this.dataSource.data = page.content;

          this.totalElements = page.totalElements;
        },

        error: (error) => this.notificationService.httpError(error),
      });
  }

  buscar(): void {
    this.page = 0;
    this.cargarCuotas();
  }

  generarCuotas(): void {
    console.log('Generar cuotas');
  }

  editar(cuota: Cuota): void {
    console.log('Editar', cuota);
  }

  eliminar(cuota: Cuota): void {
    console.log('Eliminar', cuota);
  }

  pagar(cuota: Cuota): void {
    console.log('Pagar', cuota);
  }

  anular(cuota: Cuota): void {
    console.log('Anular', cuota);
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'estado-pendiente';

      case 'PAGADA':
        return 'estado-pagada';

      case 'ANULADA':
        return 'estado-anulada';

      default:
        return '';
    }
  }

  puedePagar(estado: string): boolean {
    return estado === 'PENDIENTE';
  }

  puedeAnular(estado: string): boolean {
    return estado === 'PAGADA';
  }

  puedeEditar(estado: string): boolean {
    return estado !== 'ANULADA';
  }

  puedeEliminar(estado: string): boolean {
    return estado !== 'PAGADA';
  }

  obtenerTextoEstado(estado: string | null): string {
    return estado ?? 'SIN ESTADO';
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sortTable;
    this.dataSource.paginator = this.paginator;
  }

  obtenerTextoFechaPago(cuota: Cuota): string {
    if (cuota.estado === 'ANULADA') {
      return '—';
    }

    if (!cuota.fechaPago) {
      return 'Pendiente';
    }

    return new Date(cuota.fechaPago).toLocaleDateString('es-ES');
  }
}
