import { Component, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Socio } from '../../core/models/socios/socio';
import { SocioService } from '../../core/services/socio';
import { ConfiguracionService } from '../../core/services/configuracion';
import { NotificationService } from '../../shared/services/notification';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-cuadrillas',
  standalone: true,
  imports: [DragDropModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './cuadrillas.html',
  styleUrl: './cuadrillas.css',
})
export class CuadrillasComponent {
  private readonly socios = inject(SocioService);
  private readonly configuracion = inject(ConfiguracionService);
  private readonly notifications = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly cuadrillas = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];
  posiciones: number[] = [];
  columnas = 3;
  cuadrilla = '';
  miembros: Socio[] = [];
  cargando = false;

  puedeEditar(): boolean {
    return this.authService.puedeGestionarCuadrillas();
  }

  cambiarCuadrilla(): void {
    if (!this.cuadrilla) {
      this.miembros = [];
      this.posiciones = [];
      this.columnas = 3;
      return;
    }
    this.configuracion.obtenerCuadrilla(this.cuadrilla).subscribe({
      next: croquis => {
        this.columnas = croquis.columnas;
        this.posiciones = Array.from({ length: croquis.filas * croquis.columnas }, (_, indice) => indice + 1);
        this.cargar();
      },
      error: error => this.notifications.httpError(error),
    });
  }

  ocupante(posicion: number): Socio | undefined {
    return this.miembros.find(socio => socio.posicionCuadrilla === posicion);
  }

  soltar(evento: CdkDragDrop<number, Socio[], Socio>, posicion: number): void {
    const socio = evento.item.data as Socio;
    if (!socio || socio.posicionCuadrilla === posicion) return;
    const posicionAnterior = socio.posicionCuadrilla;
    const ocupante = this.ocupante(posicion);
    socio.posicionCuadrilla = posicion;
    if (ocupante && ocupante.id !== socio.id) ocupante.posicionCuadrilla = posicionAnterior;

    this.socios.asignarPosicionCuadrilla(socio.id, posicion).subscribe({
      next: () => {
        this.notifications.success(`Posición ${posicion} asignada a ${socio.nombre} ${socio.apellidos}.`);
        this.cargar();
      },
      error: error => {
        this.cargar();
        this.notifications.httpError(error);
      },
    });
  }

  liberar(evento: MouseEvent, socio: Socio): void {
    evento.stopPropagation();
    this.socios.liberarPosicionCuadrilla(socio.id).subscribe({
      next: () => {
        this.notifications.success(`Posición liberada para ${socio.nombre} ${socio.apellidos}.`);
        this.cargar();
      },
      error: error => this.notifications.httpError(error),
    });
  }

  private cargar(): void {
    if (!this.cuadrilla) {
      this.miembros = [];
      return;
    }
    this.cargando = true;
    this.socios.buscar('', undefined, undefined, this.cuadrilla, 0, 100, 'numeroSocio', 'asc').subscribe({
      next: respuesta => {
        this.miembros = respuesta.content;
        this.cargando = false;
      },
      error: error => {
        this.cargando = false;
        this.notifications.httpError(error);
      },
    });
  }
}
