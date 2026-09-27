import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SocioService } from '../../../core/services/socio';
import { Socio } from '../../../core/models/socios/socio';
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
import { DetalleSocioComponent } from '../detalle/detalle';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';




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
  private socioService = inject(SocioService);
  private dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  dataSource = new MatTableDataSource<Socio>();

  @ViewChild(MatSort) sortTable!: MatSort;

  textoBusqueda = '';

  estadoSeleccionado = '';
  tipoSeleccionado?: TipoSocio;
  readonly TipoSocio = TipoSocio;

  page = 0;
  size = 10;
  totalElements = 0;

  sort = 'numeroSocio';
  direction = 'asc';

  busquedaControl = new FormControl('');

  displayedColumns: string[] = [
    'numeroSocio',
    'nombre',
    'apellidos',
    'dni',
    'tipo',
    'estado',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarSocios();

    this.busquedaControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => {
        this.textoBusqueda = valor ?? '';

        this.page = 0;

        this.cargarSocios();
      });
  }

  cambiarPagina(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;

    this.cargarSocios();
  }

  private cargarSocios(): void {
    this.socioService
      .buscar(
        this.textoBusqueda,
        this.estadoSeleccionado || undefined,
        this.tipoSeleccionado,
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

    this.cargarSocios();
  }

  editar(socio: Socio): void {
    this.socioService.obtenerPorId(socio.id).subscribe({
      next: (socioDetalle) => {
        const dialogRef = this.dialog.open(FormularioComponent, {
          width: '900px',
          maxWidth: '95vw',
          disableClose: true,
          data: socioDetalle,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado) {
            this.cargarSocios();
          }
        });
      },

      error: (error) => this.notificationService.httpError(error),
    });
  }

  visualizar(socio: Socio): void {
    this.socioService.obtenerPorId(socio.id).subscribe({
      next: detalle => this.dialog.open(DetalleSocioComponent, { width: '720px', maxWidth: '95vw', data: detalle }),
      error: error => this.notificationService.httpError(error),
    });
  }

  eliminar(socio: Socio): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        titulo: 'Eliminar socio',
        mensaje: `¿Deseas eliminar definitivamente al socio
             <strong>${socio.nombre} ${socio.apellidos}</strong>?`,
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

      this.socioService.eliminar(socio.id).subscribe({
        next: () => {
          this.notificationService.success('Socio eliminado correctamente.');

          if (this.dataSource.data.length === 1 && this.page > 0) {
            this.page--;
          }

          this.cargarSocios();
        },

        error: (error) => this.notificationService.httpError(error),
      });
    });
  }

  ordenar(sort: Sort): void {
    this.sort = sort.active;

    this.direction = sort.direction || 'asc';

    this.cargarSocios();
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

  nuevoSocio(): void {
    const dialogRef = this.dialog.open(FormularioComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Formulario guardado:', resultado);

        this.cargarSocios();
      }
    });
  }
}
