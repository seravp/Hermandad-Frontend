import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SocioDetalle } from '../../../core/models/socios/socio-detalle';

@Component({ selector: 'app-detalle-socio', standalone: true, imports: [CommonModule, MatDialogModule, MatButtonModule], templateUrl: './detalle.html', styleUrl: './detalle.css' })
export class DetalleSocioComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly socio: SocioDetalle) {}
}
