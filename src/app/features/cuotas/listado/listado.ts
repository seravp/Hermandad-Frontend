import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

import { CuotaService } from '../../../core/services/cuota';
import { ConfiguracionService } from '../../../core/services/configuracion';
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
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog-data';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog';
import { CuotaDetalle } from '../../../core/models/cuotas/cuota-detalle';
import { DialogEditarCuotaComponent } from '../dialog-editar/dialog-editar';
import { ConfiguracionCuotas } from '../../../core/models/configuracion/configuracion';
import { DialogCrearCuotaComponent } from '../dialog-crear/dialog-crear';
import { CuotaRequest } from '../../socios/models/cuota-request';
import { AuthService } from '../../../core/services/auth';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';
import { ListadoPaginadorComponent } from '../../../shared/components/listado-paginador/listado-paginador';


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
    MatMenuModule,
    ListadoPaginadorComponent,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoComponent implements OnInit, AfterViewInit {
  private cuotaService = inject(CuotaService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  private readonly configuracionService = inject(ConfiguracionService);
  readonly authService = inject(AuthService);

  anios: number[] = [];
  configuracion!: ConfiguracionCuotas;

  dataSource = new MatTableDataSource<Cuota>();

  @ViewChild(MatSort)
  sortTable!: MatSort;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  textoBusqueda = '';

  estadoSeleccionado = '';

  anioSeleccionado?: number;

  tipoSeleccionado: TipoSocio | '' = '';
  cuadrillaSeleccionada = '';
  readonly TipoSocio = TipoSocio;
  readonly cuadrillas = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];

  page = 0;

  pageSize = 10;

  totalElements = 0;

  sort = 'anio';

  direction = 'asc';

  busquedaControl = new FormControl('');

  displayedColumns = [
    'numeroSocio',
    'nombreSocio',
    'tipo',
    'cuadrilla',
    'anio',
    'importe',
    'estado',
    'fechaPago',
    'acciones',
  ];

  ngOnInit(): void {
    if (!this.authService.puedeGestionarCuotas()) {
      this.displayedColumns = this.displayedColumns.filter((columna) => columna !== 'acciones');
    }

    this.cargarCuotas();

    this.cargarAnios();

    if (this.authService.puedeGestionarCuotas()) {
      this.configuracionService.obtenerConfiguracionCuotas().subscribe({
        next: (configuracion) => {
          this.configuracion = configuracion;
        },
        error: (error) => this.notificationService.httpError(error),
      });
    }

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

  irAPagina(pagina: number): void {
    this.page = pagina;
    this.cargarCuotas();
  }

  cambiarTamanoPagina(tamano: number): void {
    this.pageSize = tamano;
    this.page = 0;
    this.cargarCuotas();
  }

  ordenar(sort: Sort): void {
    this.sort = sort.active;
    this.direction = sort.direction || 'asc';
    this.page = 0;

    this.cargarCuotas();
  }

  private cargarCuotas(): void {
    this.cuotaService
      .buscar(
        this.textoBusqueda,
        this.estadoSeleccionado || undefined,
        this.anioSeleccionado,
        this.tipoSeleccionado || undefined,
        this.cuadrillaSeleccionada || undefined,
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

  exportarExcel(filtrado = false): void {
    this.cuotaService.exportarExcel(filtrado ? this.textoBusqueda : '', filtrado ? this.estadoSeleccionado || undefined : undefined, filtrado ? this.anioSeleccionado : undefined, filtrado ? this.tipoSeleccionado || undefined : undefined, filtrado ? this.cuadrillaSeleccionada || undefined : undefined).subscribe({ next: blob => { const url = URL.createObjectURL(blob); const enlace = document.createElement('a'); enlace.href = url; enlace.download = 'cuotas.xlsx'; enlace.click(); URL.revokeObjectURL(url); }, error: error => this.notificationService.httpError(error) });
  }

  generarCuotas(): void {
    const anio = this.configuracion.anioActivo;
    console.log('He pulsado generar');
    this.confirmDialog
      .confirm({
        titulo: 'Generar cuotas',

        icono: 'payments',

        color: 'primary',

        colorIcono: 'primary',

        mensaje: `
      ¿Desea generar las cuotas correspondientes al año
      <strong>${anio}</strong>?
    `,

        advertencia: 'Solo se crearán las cuotas de los socios activos que aún no la tengan.',

        textoConfirmar: 'Generar',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cuotaService.generarCuotas(anio).subscribe({
          next: (mensaje) => {
            this.notificationService.success(mensaje);

            this.cargarAnios();
            this.cargarCuotas();
          },

          error: (error) => this.notificationService.httpError(error),
        });
      });
  }

  editar(cuota: Cuota): void {
    const dialogRef = this.dialog.open(DialogEditarCuotaComponent, {
      width: '450px',
      data: cuota,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (!resultado) {
        return;
      }

      this.cuotaService.actualizar(cuota.id, resultado).subscribe({
        next: () => {
          this.notificationService.success('La cuota se ha actualizado correctamente.');

          this.cargarCuotas();
        },

        error: (error) => this.notificationService.httpError(error),
      });
    });
  }

  eliminar(cuota: Cuota): void {
    this.confirmDialog
      .confirm({
        titulo: 'Eliminar cuota',

        icono: 'delete',

        color: 'warn',

        colorIcono: 'warn',

        mensaje: `
      ¿Desea eliminar la cuota del año
      <strong>${cuota.anio}</strong>?
    `,

        advertencia: 'Esta acción no se puede deshacer.',

        textoConfirmar: 'Eliminar',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cuotaService.eliminar(cuota.id).subscribe({
          next: () => {
            this.notificationService.success('La cuota se ha eliminado correctamente.');

            this.cargarCuotas();
          },

          error: (error) => this.notificationService.httpError(error),
        });
      });
  }

  pagar(cuota: Cuota): void {
    this.confirmDialog
      .confirm({
        titulo: 'Marcar cuota como pagada',

        icono: 'payments',

        color: 'primary',

        colorIcono: 'primary',

        mensaje: `
      ¿Desea marcar como <strong>pagada</strong> la cuota del socio
      <strong>${cuota.nombreSocio}</strong>?
    `,

        advertencia: 'Se registrará la fecha actual como fecha de pago.',

        textoConfirmar: 'Marcar como pagada',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cuotaService.pagar(cuota.id).subscribe({
          next: () => {
            this.notificationService.success('La cuota se ha marcado como pagada correctamente.');

            this.cargarCuotas();
          },

          error: (error) => this.notificationService.httpError(error),
        });
      });
  }

  anular(cuota: CuotaDetalle): void {
    this.confirmDialog
      .confirm({
        titulo: 'Anular cuota',

        icono: 'block',

        color: 'accent',

        colorIcono: 'accent',

        mensaje: `
      ¿Desea <strong>anular el pago</strong> de la cuota del socio
      <strong>${cuota.nombreSocio}</strong> correspondiente al año
      <strong>${cuota.anio}</strong>?
    `,

        advertencia: 'La cuota quedará anulada.',

        textoConfirmar: 'Anular cuota',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cuotaService.anular(cuota.id).subscribe({
          next: () => {
            this.notificationService.success('El pago se ha anulado correctamente.');

            this.cargarCuotas();
          },

          error: (error) => this.notificationService.httpError(error),
        });
      });
  }

  deshacerPago(cuota: CuotaDetalle): void {
    this.confirmDialog
      .confirm({
        titulo: 'Deshacer pago',

        icono: 'undo',

        color: 'accent',

        colorIcono: 'accent',

        mensaje: `
      ¿Desea <strong>deshacer el pago</strong> de la cuota del socio
      <strong>${cuota.nombreSocio}</strong> correspondiente al año
      <strong>${cuota.anio}</strong>?
    `,

        advertencia: 'La cuota volverá a quedar pendiente de pago.',

        textoConfirmar: 'Deshacer pago',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cuotaService.deshacerPago(cuota.id).subscribe({
          next: () => {
            this.notificationService.success('El pago se ha deshecho correctamente.');

            this.cargarCuotas();
          },

          error: (error) => this.notificationService.httpError(error),
        });
      });
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

  puedeDeshacer(estado: string): boolean {
    return estado === 'PAGADA';
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

  nuevaCuota(): void {
    const dialogRef = this.dialog.open(DialogCrearCuotaComponent, {
      width: '650px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        anio: this.configuracion?.anioActivo ?? new Date().getFullYear(),

        importeCuotaHermano: this.configuracion?.importeCuotaHermano ?? 0,
        importeCuotaCostalero: this.configuracion?.importeCuotaCostalero ?? 0,
        tipoPermitido: this.authService.obtenerRol() === 'SECRETARIO' ? TipoSocio.COSTALERO : undefined,
      },
    });

    dialogRef.afterClosed().subscribe((request: CuotaRequest | undefined) => {
      if (!request) {
        return;
      }

      this.cuotaService.crear(request).subscribe({
        next: () => {
          this.notificationService.success('Cuota creada correctamente.');

          this.cargarAnios();
          this.cargarCuotas();
        },
        error: (error) => this.notificationService.httpError(error),
      });
    });
  }

  private cargarAnios(): void {
    this.cuotaService.obtenerAnios().subscribe({
      next: (anios) => {
        this.anios = anios;
      },
      error: (error) => this.notificationService.httpError(error),
    });
  }
}
