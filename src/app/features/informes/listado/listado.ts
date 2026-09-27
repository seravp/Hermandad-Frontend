import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { InformeService } from '../../../core/services/informe';
import { NotificationService } from '../../../shared/services/notification';

@Component({
  selector: 'app-listado-informes',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoInformesComponent {
  private readonly informeService = inject(InformeService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  generando: string | null = null;

  generarMorosos(): void {
    this.generando = 'morosos';

    this.informeService.generarInformeMorosos().subscribe({
      next: (pdf) => {
        this.abrirPdf(pdf);
        this.notificationService.success('Informe de morosos generado correctamente.');
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

  private abrirPdf(pdf: Blob): void {
    const url = URL.createObjectURL(pdf);

    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private finalizarGeneracion(): void {
    this.generando = null;
    this.cdr.detectChanges();
  }

  descargarExcel(tipo: 'hermanos' | 'morosos' | 'cuotas'): void {
    const solicitudes = {
      hermanos: this.informeService.exportarExcelHermanos(),
      morosos: this.informeService.exportarExcelMorosos(),
      cuotas: this.informeService.exportarExcelCuotas(),
    };

    const nombres = {
      hermanos: 'hermanos.xlsx',
      morosos: 'morosos.xlsx',
      cuotas: 'cuotas.xlsx',
    };

    const etiquetas = {
      hermanos: 'Listado de hermanos',
      morosos: 'Listado de morosos',
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
