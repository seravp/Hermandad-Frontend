import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { InformeService } from '../../../core/services/informe';
import { NotificationService } from '../../../shared/services/notification';
import { CartaRequest, DialogCartaComponent } from '../dialog-carta/dialog-carta';
import { DialogCartasGuardadasComponent } from '../dialog-cartas-guardadas/dialog-cartas-guardadas';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-listado-informes',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoInformesComponent {
  private readonly informeService = inject(InformeService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);

  generando: string | null = null;

  generarMorosos(): void {
    this.generando = 'morosos';

    this.informeService.generarInformeMorosos().subscribe({
      next: (pdf) => {
        this.abrirPdf(pdf);
        this.notificationService.success('Informe de cuotas pendientes generado correctamente.');
        this.finalizarGeneracion();
      },
      error: (error) => {
        this.notificationService.httpError(error);
        this.finalizarGeneracion();
      },
    });
  }

  generarDomiciliados(): void {
    this.generando = 'domiciliados';

    this.informeService.generarInformeDomiciliados().subscribe({
      next: (pdf) => {
        this.abrirPdf(pdf);
        this.notificationService.success('Listado de domiciliados generado correctamente.');
        this.finalizarGeneracion();
      },
      error: (error) => {
        this.notificationService.httpError(error);
        this.finalizarGeneracion();
      },
    });
  }

  abrirFormularioCartas(): void {
    this.dialog.open(DialogCartaComponent, { width: '680px', maxWidth: '96vw', disableClose: true })
      .afterClosed().subscribe((solicitud: CartaRequest | undefined) => {
        if (!solicitud) return;
        this.generando = 'cartas';
        this.informeService.generarCartas(solicitud).subscribe({
          next: (archivo) => {
            const documentosSeparados = solicitud.sociosIds.length > 1 && solicitud.modoGeneracion === 'SEPARADOS';
            const nombre = documentosSeparados
              ? 'cartas-hermandad.zip'
              : solicitud.formato === 'PDF' ? 'carta-hermandad.pdf' : 'carta-hermandad.docx';
            this.descargarArchivo(archivo, nombre);
            this.notificationService.success(documentosSeparados
              ? 'Las cartas se han generado correctamente en un archivo ZIP.'
              : 'La carta se ha generado correctamente.');
            this.finalizarGeneracion();
          },
          error: (error) => { this.notificationService.httpError(error); this.finalizarGeneracion(); },
        });
      });
  }

  abrirCartasGuardadas(): void {
    this.dialog.open(DialogCartasGuardadasComponent, { width: '720px', maxWidth: '96vw' });
  }

  private abrirPdf(pdf: Blob): void {
    const url = URL.createObjectURL(pdf);

    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private finalizarGeneracion(): void {
    this.generando = null;
    this.cdr.detectChanges();
  }

  descargarExcel(tipo: 'socios' | 'morosos' | 'cuotas'): void {
    const solicitudes = {
      socios: this.informeService.exportarExcelSocios(),
      morosos: this.informeService.exportarExcelMorosos(),
      cuotas: this.informeService.exportarExcelCuotas(),
    };

    const nombres = {
      socios: 'socios.xlsx',
      morosos: 'cuotas-pendientes.xlsx',
      cuotas: 'cuotas.xlsx',
    };

    const etiquetas = {
      socios: 'Listado de socios',
      morosos: 'Listado de cuotas pendientes',
      cuotas: 'Listado de cuotas',
    };

    this.generando = `excel-${tipo}`;

    solicitudes[tipo].subscribe({
      next: (excel) => {
        this.descargarArchivo(excel, nombres[tipo]);

        this.notificationService.success(`${etiquetas[tipo]} exportado correctamente.`);

        this.finalizarGeneracion();
      },
      error: (error) => {
        this.notificationService.httpError(error);
        this.finalizarGeneracion();
      },
    });
  }

  private descargarArchivo(archivo: Blob, nombre: string): void {
    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();

    URL.revokeObjectURL(url);
  }
}
