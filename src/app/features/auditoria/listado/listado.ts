import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Auditoria } from '../../../core/models/auditoria/auditoria';
import { AuditoriaService } from '../../../core/services/auditoria';
import { NotificationService } from '../../../shared/services/notification';
import { ListadoPaginadorComponent } from '../../../shared/components/listado-paginador/listado-paginador';

@Component({
  selector: 'app-listado-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    ListadoPaginadorComponent,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoAuditoriaComponent implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly usuarioControl = new FormControl('');
  readonly entidadControl = new FormControl('');

  readonly acciones = [
    'CREAR',
    'MODIFICAR',
    'ELIMINAR',
    'PAGAR',
    'ANULAR',
    'DESHACER-PAGO',
    'GENERAR_ANUALES',
    'CAMBIAR_PASSWORD',
  ];

  readonly displayedColumns = ['fecha', 'usuario', 'accion', 'entidad', 'registroId'];

  auditorias: Auditoria[] = [];

  accionSeleccionada = '';
  page = 0;
  size = 20;
  totalElements = 0;

  ngOnInit(): void {
    this.cargarAuditoria();

    this.usuarioControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.buscar());

    this.entidadControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.buscar());
  }

  buscar(): void {
    this.page = 0;
    this.cargarAuditoria();
  }

  cambiarPagina(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.cargarAuditoria();
  }

  irAPagina(pagina: number): void {
    this.page = pagina;
    this.cargarAuditoria();
  }

  cambiarTamanoPagina(tamano: number): void {
    this.size = tamano;
    this.page = 0;
    this.cargarAuditoria();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  private cargarAuditoria(): void {
    this.auditoriaService
      .buscar(
        this.usuarioControl.value ?? '',
        this.accionSeleccionada,
        this.entidadControl.value ?? '',
        this.page,
        this.size,
      )
      .subscribe({
        next: (respuesta) => {
          this.auditorias = respuesta.content;
          this.totalElements = respuesta.totalElements;

          this.cdr.detectChanges();
        },
        error: (error) => this.notificationService.httpError(error),
      });
  }
}
