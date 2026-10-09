import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormularioComponent } from '../formulario/formulario';
import { NotificationService } from '../../../shared/services/notification';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { DetalleSocioComponent } from '../detalle/detalle';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';
import { ListadoPaginadorComponent } from '../../../shared/components/listado-paginador/listado-paginador';
import { AuthService } from '../../../core/services/auth';




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
    MatTooltipModule,
    MatMenuModule,
    ListadoPaginadorComponent,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoComponent implements OnInit {
  private socioService = inject(SocioService);
  private dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  readonly authService = inject(AuthService);
  dataSource = new MatTableDataSource<Socio>();

  @ViewChild(MatSort) sortTable!: MatSort;
  @ViewChild('archivoImportacion') archivoImportacion?: ElementRef<HTMLInputElement>;

  textoBusqueda = '';

  estadoSeleccionado = '';
  tipoSeleccionado: TipoSocio | '' = '';
  cuadrillaSeleccionada = '';
  readonly TipoSocio = TipoSocio;
  readonly cuadrillas = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];

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
    'cuadrilla',
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

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.size));
  }

  get desde(): number {
    return this.totalElements ? this.page * this.size + 1 : 0;
  }

  get hasta(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  get paginasVisibles(): number[] {
    const total = this.totalPaginas;
    const inicio = Math.max(0, Math.min(this.page - 2, total - 5));
    const fin = Math.min(total, inicio + 5);

    return Array.from({ length: fin - inicio }, (_, indice) => inicio + indice);
  }

  irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.page) {
      return;
    }

    this.page = pagina;
    this.cargarSocios();
  }

  cambiarTamanoPagina(size: number): void {
    this.size = Number(size);
    this.page = 0;
    this.cargarSocios();
  }

  private cargarSocios(): void {
    this.socioService
      .buscar(
        this.textoBusqueda,
        this.estadoSeleccionado || undefined,
        this.tipoSeleccionado || undefined,
        this.cuadrillaSeleccionada || undefined,
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

  exportarExcel(filtrado = false): void {
    this.socioService.exportarExcel(filtrado ? this.textoBusqueda : '', filtrado ? this.estadoSeleccionado || undefined : undefined, filtrado ? this.tipoSeleccionado : undefined, filtrado ? this.cuadrillaSeleccionada || undefined : undefined).subscribe({ next: blob => { const url = URL.createObjectURL(blob); const enlace = document.createElement('a'); enlace.href = url; enlace.download = 'socios.xlsx'; enlace.click(); URL.revokeObjectURL(url); }, error: error => this.notificationService.httpError(error) });
  }

  seleccionarArchivoImportacion(): void {
    this.archivoImportacion?.nativeElement.click();
  }

  descargarPlantillaImportacion(): void {
    this.socioService.descargarPlantillaImportacion().subscribe({
      next: archivo => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'plantilla-importacion-socios.xlsx';
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: error => this.notificationService.httpError(error),
    });
  }

  importarExcel(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.socioService.importarExcel(archivo).subscribe({
      next: resultado => {
        const resumen = `${resultado.importados} socio(s) importado(s)`;
        if (resultado.omitidos) {
          this.notificationService.warning(`${resumen}. ${resultado.omitidos} fila(s) omitida(s): ${resultado.errores.slice(0, 2).join(' ')}`);
        } else {
          this.notificationService.success(`${resumen} correctamente.`);
        }
        input.value = '';
        this.page = 0;
        this.cargarSocios();
      },
      error: error => {
        input.value = '';
        this.notificationService.httpError(error);
      },
    });
  }
}
