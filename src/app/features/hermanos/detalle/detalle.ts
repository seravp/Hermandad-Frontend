import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HermanoDetalle } from '../../../core/models/hermanos/hermano-detalle';

@Component({ selector: 'app-detalle-hermano', standalone: true, imports: [CommonModule, MatDialogModule, MatButtonModule], templateUrl: './detalle.html', styleUrl: './detalle.css' })
export class DetalleHermanoComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly hermano: HermanoDetalle) {}
}
