import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ElementoInventario } from '../../../core/models/inventario/inventario';
import { InventarioService } from '../../../core/services/inventario';

@Component({ selector: 'app-detalle-inventario', standalone: true, imports: [CommonModule, MatDialogModule, MatButtonModule], templateUrl: './detalle.html', styleUrl: './detalle.css' })
export class DetalleInventarioComponent implements OnInit, OnDestroy {
  private readonly service = inject(InventarioService); private readonly cdr = inject(ChangeDetectorRef); imagen?: string;
  constructor(@Inject(MAT_DIALOG_DATA) readonly item: ElementoInventario) {}
  ngOnInit(): void { if (this.item.imagenUrl) this.service.obtenerImagen(this.item.imagenUrl).subscribe(blob => { this.imagen = URL.createObjectURL(blob); this.cdr.detectChanges(); }); }
  ngOnDestroy(): void { if (this.imagen) URL.revokeObjectURL(this.imagen); }
}
