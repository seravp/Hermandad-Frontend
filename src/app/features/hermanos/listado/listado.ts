import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HermanoService } from '../../../core/services/hermano';
import { Hermano } from '../../../core/models/hermanos/hermano';
import { MatTableDataSource } from '@angular/material/table';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormularioComponent } from '../formulario/formulario';
import { NotificationService } from '../../../shared/services/notification';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DetalleHermanoComponent } from '../detalle/detalle';




@Component({
  selector: 'app-listado',
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
export class ListadoComponent implements OnInit {
  private hermanoService = inject(HermanoService);
  private dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  dataSource = new MatTableDataSource<Hermano>();

  @ViewChild(MatSort) sortTable!: MatSort;

  textoBusqueda = '';

  estadoSeleccionado = '';

  page = 0;
  size = 10;
  totalElements = 0;

  sort = 'numeroHermano';
  direction = 'asc';

  busquedaControl = new FormControl('');

  displayedColumns: string[] = [
    'numeroHermano',
    'nombre',
    'apellidos',
    'dni',
    'estado',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarHermanos();

    this.busquedaControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => {
        this.textoBusqueda = valor ?? '';

        this.page = 0;

        this.cargarHermanos();
      });
  }

  cambiarPagina(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;

    this.cargarHermanos();
  }

  private cargarHermanos(): void {
    this.hermanoService
      .buscar(
        this.textoBusqueda,
        this.estadoSeleccionado || undefined,
        this.page,
        this.size,
        this.sort,
        this.direction,
      )
      .subscribe({
        next: (respuesta) => {
          this.dataSource.data = respuesta.content;
          this.totalElements = respuesta.totalElements;
        },

        error: (err) => {
          console.error(err);
        },
      });
  }

  buscar(): void {
    this.page = 0;

    this.cargarHermanos();
  }

  editar(hermano: Hermano): void {
    this.hermanoService.obtenerPorId(hermano.id).subscribe({
      next: (hermanoDetalle) => {
        const dialogRef = this.dialog.open(FormularioComponent, {
          width: '900px',
          maxWidth: '95vw',
          disableClose: true,
          data: hermanoDetalle,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado) {
            this.cargarHermanos();
          }
        });
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  visualizar(hermano: Hermano): void {
    this.hermanoService.obtenerPorId(hermano.id).subscribe({
      next: detalle => this.dialog.open(DetalleHermanoComponent, { width: '720px', maxWidth: '95vw', data: detalle }),
      error: error => this.notificationService.httpError(error),
    });
  }

  eliminar(hermano: Hermano): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        titulo: 'Eliminar hermano',
        mensaje: `¿Deseas eliminar definitivamente al hermano
             <strong>${hermano.nombre} ${hermano.apellidos}</strong>?`,
        advertencia: 'Esta acción no se puede deshacer.',
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar',
        icono: 'delete',
        color: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.hermanoService.eliminar(hermano.id).subscribe({
        next: () => {
          this.notificationService.success('Hermano eliminado correctamente.');

          if (this.dataSource.data.length === 1 && this.page > 0) {
            this.page--;
          }

          this.cargarHermanos();
        },

        error: (error) => this.notificationService.httpError(error),
      });
    });
  }

  ordenar(sort: Sort): void {
    this.sort = sort.active;

    this.direction = sort.direction || 'asc';

    this.cargarHermanos();
  }

  obtenerColorEstado(estado: string): 'primary' | 'warn' | 'accent' {
    switch (estado) {
      case 'ACTIVO':
        return 'primary';

      case 'BAJA':
        return 'warn';

      default:
        return 'accent';
    }
  }

  obtenerClaseEstado(estado: string | null): string {
    switch (estado) {
      case 'ACTIVO':
        return 'estado-activo';

      case 'BAJA':
        return 'estado-baja';

      default:
        return 'estado-desconocido';
    }
  }

  obtenerTextoEstado(estado: string | null): string {
    return estado ?? 'SIN ESTADO';
  }

  nuevoHermano(): void {
    const dialogRef = this.dialog.open(FormularioComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Formulario guardado:', resultado);

        this.cargarHermanos();
      }
    });
  }
}
