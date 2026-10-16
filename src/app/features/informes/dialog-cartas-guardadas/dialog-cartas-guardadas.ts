import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CartaGuardada, InformeService } from '../../../core/services/informe';
import { NotificationService } from '../../../shared/services/notification';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-dialog-cartas-guardadas', standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './dialog-cartas-guardadas.html', styleUrl: './dialog-cartas-guardadas.css',
})
export class DialogCartasGuardadasComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DialogCartasGuardadasComponent>);
  private readonly informeService = inject(InformeService);
  private readonly notifications = inject(NotificationService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  cartas: CartaGuardada[] = [];
  cargando = true;
  errorCarga = false;

  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando = true;
    this.errorCarga = false;
    this.informeService.listarCartasGuardadas().pipe(timeout(10000)).subscribe({
      next: (cartas) => {
        this.cartas = cartas;
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.cargando = false;
        this.errorCarga = true;
        this.changeDetector.detectChanges();
        this.notifications.httpError(error);
      },
    });
  }
  descargar(carta: CartaGuardada): void {
    this.informeService.descargarCartaGuardada(carta.id).subscribe({
      next: (archivo) => {
        const url = URL.createObjectURL(archivo); const enlace = document.createElement('a');
        enlace.href = url; enlace.download = carta.nombreArchivo; enlace.click(); URL.revokeObjectURL(url);
      }, error: (error) => this.notifications.httpError(error),
    });
  }
  cerrar(): void { this.dialogRef.close(); }
}
