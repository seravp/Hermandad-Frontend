import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { EstadoInventario, ElementoInventario } from '../../../core/models/inventario/inventario';
import { InventarioService } from '../../../core/services/inventario';
import { NotificationService } from '../../../shared/services/notification';
import { AuthService } from '../../../core/services/auth';
import { FormularioInventarioComponent } from '../formulario/formulario';
import { DetalleInventarioComponent } from '../detalle/detalle';
import { ListadoPaginadorComponent } from '../../../shared/components/listado-paginador/listado-paginador';

@Component({
  selector: 'app-listado-inventario', standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule, MatMenuModule, ListadoPaginadorComponent],
  templateUrl: './listado.html', styleUrl: './listado.css',
})
export class ListadoInventarioComponent implements OnInit {
  private readonly service = inject(InventarioService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);
  readonly busqueda = new FormControl('');
  readonly estados: EstadoInventario[] = ['BUENO', 'REGULAR', 'DETERIORADO', 'RESTAURACION', 'EXTRAVIADO'];
  readonly categorias = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];
  readonly columnas = ['codigo', 'nombre', 'categoria', 'ubicacion', 'estado', 'valor', 'acciones'];
  elementos: ElementoInventario[] = [];
  estado?: EstadoInventario;
  categoria = '';
  page = 0; size = 20; total = 0;
  ngOnInit(): void {
    this.cargar();
    this.busqueda.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => { this.page = 0; this.cargar(); });
  }
  cargar(): void {
    this.service.buscar(this.busqueda.value ?? '', this.categoria, this.estado, this.page, this.size).subscribe({
      next: r => {
        this.elementos = r.content;
        this.total = r.totalElements;
        this.cdr.detectChanges();
      },
      error: e => this.notifications.httpError(e),
    });
  }
  filtrar(): void { this.page = 0; this.cargar(); }
  exportarExcel(filtrado = false): void {
    const texto = filtrado ? this.busqueda.value ?? '' : '';
    const categoria = filtrado ? this.categoria : '';
    const estado = filtrado ? this.estado : undefined;
    this.service.exportarExcel(texto, categoria, estado).subscribe({
      next: archivo => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'inventario.xlsx';
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: error => this.notifications.httpError(error),
    });
  }
  pagina(event: PageEvent): void { this.page = event.pageIndex; this.size = event.pageSize; this.cargar(); }
  irAPagina(pagina: number): void { this.page = pagina; this.cargar(); }
  cambiarTamanoPagina(tamano: number): void { this.size = tamano; this.page = 0; this.cargar(); }
  nuevo(): void { this.abrirFormulario(); }
  editar(item: ElementoInventario): void { this.abrirFormulario(item); }
  ver(item: ElementoInventario): void { this.dialog.open(DetalleInventarioComponent, { width: '760px', maxWidth: '95vw', data: item }); }
  private abrirFormulario(item?: ElementoInventario): void { this.dialog.open(FormularioInventarioComponent, { width: '720px', maxWidth: '95vw', disableClose: true, data: item }).afterClosed().subscribe(ok => { if (ok) this.cargar(); }); }
  puedeGestionar(): boolean { return this.authService.puedeGestionarInventario(); }
}
