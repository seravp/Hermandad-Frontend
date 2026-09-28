import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-listado-paginador', standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './listado-paginador.html', styleUrl: './listado-paginador.css',
})
export class ListadoPaginadorComponent {
  @Input() total = 0;
  @Input() pagina = 0;
  @Input() tamano = 10;
  @Input() etiqueta = 'resultados';
  @Input() opcionesTamano = [5, 10, 20, 50];
  @Output() paginaChange = new EventEmitter<number>();
  @Output() tamanoChange = new EventEmitter<number>();

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.total / this.tamano)); }
  get desde(): number { return this.total ? this.pagina * this.tamano + 1 : 0; }
  get hasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.total); }
  get paginasVisibles(): number[] {
    const inicio = Math.max(0, Math.min(this.pagina - 2, this.totalPaginas - 5));
    const fin = Math.min(this.totalPaginas, inicio + 5);
    return Array.from({ length: fin - inicio }, (_, indice) => inicio + indice);
  }
  irAPagina(pagina: number): void { if (pagina >= 0 && pagina < this.totalPaginas && pagina !== this.pagina) this.paginaChange.emit(pagina); }
  cambiarTamano(tamano: number): void { this.tamanoChange.emit(Number(tamano)); }
}
