import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ElementoInventario, ElementoInventarioRequest, EstadoInventario } from '../../../core/models/inventario/inventario';
import { InventarioService } from '../../../core/services/inventario';
import { NotificationService } from '../../../shared/services/notification';

@Component({ selector: 'app-formulario-inventario', standalone: true, imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule], templateUrl: './formulario.html', styleUrl: './formulario.css' })
export class FormularioInventarioComponent {
  private readonly fb = inject(FormBuilder); private readonly service = inject(InventarioService); private readonly notifications = inject(NotificationService);
  readonly estados: EstadoInventario[] = ['BUENO', 'REGULAR', 'DETERIORADO', 'RESTAURACION', 'EXTRAVIADO'];
  readonly categorias = ['Nuestra Señora de los Dolores', 'Nuestro Padre Jesús Nazareno', 'Santo Entierro de Cristo', 'Calvario', 'Nazarenos', 'Otros'];
  readonly form = this.fb.nonNullable.group({ codigo: ['', Validators.required], nombre: ['', Validators.required], categoria: ['', Validators.required], descripcion: [''], ubicacion: ['', Validators.required], estado: ['BUENO' as EstadoInventario, Validators.required], fechaAdquisicion: [''], valorAdquisicion: [null as number | null], observaciones: [''] });
  archivo?: File;
  constructor(private readonly dialogRef: MatDialogRef<FormularioInventarioComponent>, @Inject(MAT_DIALOG_DATA) readonly item?: ElementoInventario) { if (item) this.form.patchValue(item); }
  seleccionarImagen(event: Event): void { this.archivo = (event.target as HTMLInputElement).files?.[0]; }
  guardar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const request = this.form.getRawValue() as ElementoInventarioRequest; const op = this.item ? this.service.actualizar(this.item.id, request) : this.service.crear(request); op.subscribe({ next: bien => { if (!this.archivo) { this.finalizar(); return; } this.service.subirImagen(bien.id, this.archivo).subscribe({ next: () => this.finalizar(), error: e => this.notifications.httpError(e) }); }, error: e => this.notifications.httpError(e) }); }
  private finalizar(): void { this.notifications.success(this.item ? 'Bien actualizado correctamente.' : 'Bien creado correctamente.'); this.dialogRef.close(true); }
}
