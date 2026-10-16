import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListadoPaginadorComponent } from '../../../shared/components/listado-paginador/listado-paginador';
import { NotificationService } from '../../../shared/services/notification';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog';
import { ComparativaTesoreria, MovimientoTesoreria, MovimientoTesoreriaRequest, ResumenTesoreria, TipoMovimientoTesoreria } from '../../../core/models/tesoreria/tesoreria';
import { TesoreriaService } from '../../../core/services/tesoreria';
import { ConfiguracionService } from '../../../core/services/configuracion';
import { DialogMovimientoTesoreriaComponent } from '../dialog-movimiento/dialog-movimiento';

@Component({
  selector: 'app-tesoreria', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule, MatTableModule, MatTooltipModule, ListadoPaginadorComponent],
  providers: [CurrencyPipe],
  templateUrl: './tesoreria.html', styleUrl: './tesoreria-completa.css',
})
export class TesoreriaComponent implements OnInit {
  private readonly service = inject(TesoreriaService);
  private readonly configuracion = inject(ConfiguracionService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  resumen: ResumenTesoreria = { saldoActual: 0, ingresos: 0, gastos: 0, cuotasCobradas: 0, previsionCuotas: 0, evolucionMensual: [], distribucionIngresos: [] };
  resumenGeneral: ResumenTesoreria = { saldoActual: 0, ingresos: 0, gastos: 0, cuotasCobradas: 0, previsionCuotas: 0, evolucionMensual: [], distribucionIngresos: [] };
  movimientos: MovimientoTesoreria[] = [];
  categorias: string[] = [];
  anios: number[] = [];
  comparativa?: ComparativaTesoreria;
  anioBase = new Date().getFullYear();
  anioComparativo = this.anioBase - 1;
  page = 0; pageSize = 10; total = 0;
  alcanceMovimientos: 'EJERCICIO' | 'GENERAL' = 'EJERCICIO';
  readonly tipos: { valor: TipoMovimientoTesoreria; texto: string }[] = [{ valor: 'INGRESO', texto: 'Ingreso' }, { valor: 'GASTO', texto: 'Gasto' }];
  readonly columnas = ['fecha', 'concepto', 'categoria', 'tipo', 'importe', 'formaPago', 'acciones'];
  filtros = this.fb.group({ tipo: [''], categoria: [''], desde: [''], hasta: [''] });

  ngOnInit(): void {
    this.cargarCategorias();
    this.configuracion.obtenerConfiguracionCuotas().subscribe({
      next: configuracion => {
        this.anioBase = configuracion.anioActivo;
        this.anioComparativo = this.anioBase - 1;
        this.cargarAnios();
        this.seleccionarAnio();
      },
      error: e => {
        this.notifications.httpError(e);
        this.cargarAnios();
        this.seleccionarAnio();
      },
    });
  }
  cargar(): void {
    const f = this.filtros.getRawValue();
    this.service.resumen(f.desde || undefined, f.hasta || undefined).subscribe({ next: r => { this.resumen = r; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) });
    this.service.resumen().subscribe({ next: r => { this.resumenGeneral = r; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) });
    this.cargarMovimientos();
    this.service.comparativa(this.anioBase, this.anioComparativo).subscribe({ next: r => { this.comparativa = r; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) });
  }
  aplicarFiltros(): void { this.page = 0; this.cargar(); }
  limpiarFiltros(): void { this.filtros.reset({ tipo: '', categoria: '', desde: '', hasta: '' }); this.page = 0; this.cargar(); }
  seleccionarAnio(): void { this.filtros.patchValue({ desde: `${this.anioBase}-01-01`, hasta: `${this.anioBase}-12-31` }); this.page = 0; this.cargar(); }
  exportarExcel(historico = false): void {
    const f = this.filtros.getRawValue();
    this.service.exportarExcel(
      historico ? undefined : f.tipo as TipoMovimientoTesoreria || undefined,
      historico ? undefined : f.categoria || undefined,
      historico ? undefined : f.desde || undefined,
      historico ? undefined : f.hasta || undefined,
    ).subscribe({ next: blob => { const url = URL.createObjectURL(blob); const enlace = document.createElement('a'); enlace.href = url; enlace.download = historico ? 'tesoreria-historico.xlsx' : `tesoreria-${this.anioBase}.xlsx`; enlace.click(); URL.revokeObjectURL(url); }, error: e => this.notifications.httpError(e) });
  }
  nueva(): void { this.abrirDialogo(); }
  editar(m: MovimientoTesoreria): void { this.abrirDialogo(m); }
  eliminar(m: MovimientoTesoreria): void { this.confirm.confirm({ titulo: 'Eliminar movimiento', icono: 'delete', color: 'warn', colorIcono: 'warn', mensaje: `¿Desea eliminar el movimiento <strong>${m.concepto}</strong>?`, advertencia: 'Esta acción no se puede deshacer.', textoConfirmar: 'Eliminar' }).subscribe(ok => { if (ok) this.service.eliminar(m.id).subscribe({ next: () => { this.notifications.success('Movimiento eliminado correctamente.'); this.cargarCategorias(); this.cargar(); }, error: e => this.notifications.httpError(e) }); }); }
  cambiarPagina(p: number): void { this.page = p; this.cargarMovimientos(); }
  cambiarTamanoPagina(s: number): void { this.pageSize = s; this.page = 0; this.cargarMovimientos(); }
  cambiarAlcanceMovimientos(): void { this.page = 0; this.cargarMovimientos(); }
  altura(valor: number): string { const max = Math.max(...this.resumen.evolucionMensual.flatMap(m => [m.ingresos, m.gastos]), 1); return `${Math.max(3, valor * 100 / max)}%`; }
  porcentajeCategoria(valor: number): string { const total = this.resumen.distribucionIngresos.reduce((s, c) => s + c.importe, 0); return total ? `${(valor * 100 / total).toFixed(1)}%` : '0%'; }
  variacion(actual: number, anterior: number): string { if (!anterior) return actual ? 'Nuevo registro' : 'Sin cambios'; const porcentaje = ((actual - anterior) * 100) / anterior; return `${porcentaje >= 0 ? '+' : ''}${porcentaje.toFixed(1)} %`; }
  esMejora(actual: number, anterior: number, inverso = false): boolean { return inverso ? actual <= anterior : actual >= anterior; }
  colorCategoria(indice: number): string { return ['#0c4775', '#d5a12f', '#75a5d6', '#81b89a', '#9a78bf', '#d97979'][indice % 6]; }
  gradienteDistribucion(): string {
    const total = this.resumen.distribucionIngresos.reduce((s, categoria) => s + categoria.importe, 0);
    if (!total) return 'conic-gradient(#edf2f7 0deg 360deg)';
    let inicio = 0;
    const tramos = this.resumen.distribucionIngresos.map((categoria, indice) => {
      const fin = inicio + (categoria.importe / total) * 360;
      const tramo = `${this.colorCategoria(indice)} ${inicio}deg ${fin}deg`;
      inicio = fin;
      return tramo;
    });
    return `conic-gradient(${tramos.join(', ')})`;
  }
  private cargarMovimientos(): void {
    const f = this.filtros.getRawValue();
    const ejercicioActual = this.alcanceMovimientos === 'EJERCICIO';
    this.service.movimientos(
      f.tipo as TipoMovimientoTesoreria || undefined,
      f.categoria || undefined,
      ejercicioActual ? f.desde || undefined : undefined,
      ejercicioActual ? f.hasta || undefined : undefined,
      this.page,
      this.pageSize,
    ).subscribe({ next: r => { this.movimientos = r.content; this.total = r.totalElements; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) });
  }
  private cargarCategorias(): void { this.service.categorias().subscribe({ next: c => { this.categorias = c; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) }); }
  private cargarAnios(): void { this.service.anios().subscribe({ next: anios => { this.anios = [...new Set([...anios, this.anioBase])].sort((a, b) => b - a); if (this.anioComparativo === this.anioBase) this.anioComparativo = this.anios.find(anio => anio !== this.anioBase) ?? this.anioBase - 1; this.cdr.detectChanges(); }, error: e => this.notifications.httpError(e) }); }
  private abrirDialogo(movimiento?: MovimientoTesoreria): void {
    this.dialog.open(DialogMovimientoTesoreriaComponent, { width: '620px', maxWidth: '95vw', disableClose: true, data: movimiento ?? null })
      .afterClosed().subscribe((request: MovimientoTesoreriaRequest | undefined) => {
        if (!request) return;
        const operacion = movimiento ? this.service.actualizar(movimiento.id, request) : this.service.crear(request);
        operacion.subscribe({
          next: () => {
            this.notifications.success(movimiento ? 'Movimiento actualizado correctamente.' : 'Movimiento registrado correctamente.');
            this.cargarCategorias();
            this.cargar();
          },
          error: e => this.notifications.httpError(e),
        });
      });
  }
}
