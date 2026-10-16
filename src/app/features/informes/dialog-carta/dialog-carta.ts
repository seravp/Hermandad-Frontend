import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocioService } from '../../../core/services/socio';
import { Socio } from '../../../core/models/socios/socio';
import { NotificationService } from '../../../shared/services/notification';

export interface CartaRequest {
  sociosIds: number[];
  cuerpo: string;
  formato: 'PDF' | 'WORD';
  modoGeneracion: 'UNICO' | 'SEPARADOS';
}

@Component({
  selector: 'app-dialog-carta',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatTooltipModule],
  templateUrl: './dialog-carta.html',
  styleUrl: './dialog-carta.css',
})
export class DialogCartaComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogCartaComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly socioService = inject(SocioService);
  private readonly notifications = inject(NotificationService);

  socios: Socio[] = [];
  cargandoSocios = true;
  @ViewChild('editor') editor?: ElementRef<HTMLDivElement>;

  readonly formulario = this.fb.group({
    sociosIds: this.fb.nonNullable.control<number[]>([], Validators.required),
    cuerpo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(10_000_000)]),
    formato: this.fb.nonNullable.control<'PDF' | 'WORD'>('PDF', Validators.required),
    modoGeneracion: this.fb.nonNullable.control<'UNICO' | 'SEPARADOS'>('UNICO', Validators.required),
  });

  constructor() {
    this.socioService.buscar('', undefined, undefined, undefined, 0, 1000, 'nombre', 'asc').subscribe({
      next: (pagina) => { this.socios = pagina.content; this.cargandoSocios = false; },
      error: (error) => { this.cargandoSocios = false; this.notifications.httpError(error); },
    });
  }

  cancelar(): void { this.dialogRef.close(); }

  get todosSeleccionados(): boolean {
    return this.socios.length > 0 && this.formulario.controls.sociosIds.value.length === this.socios.length;
  }

  cambiarSeleccionTodos(seleccionar: boolean): void {
    this.formulario.controls.sociosIds.setValue(seleccionar ? this.socios.map((socio) => socio.id) : []);
    this.formulario.controls.sociosIds.markAsTouched();
  }

  actualizarCuerpo(evento: Event): void {
    const contenido = (evento.target as HTMLDivElement).innerHTML;
    this.formulario.controls.cuerpo.setValue(contenido);
    this.formulario.controls.cuerpo.markAsTouched();
  }

  aplicarFormato(comando: string, valor?: string): void {
    document.execCommand(comando, false, valor);
    this.actualizarCuerpoDesdeEditor();
  }

  alPegar(evento: ClipboardEvent): void {
    const imagen = Array.from(evento.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'));
    if (!imagen) return;
    evento.preventDefault();
    const archivo = imagen.getAsFile();
    if (archivo) this.insertarArchivoImagen(archivo);
  }

  alPulsarTecla(evento: KeyboardEvent): void {
    if (evento.key !== 'Tab') return;
    evento.preventDefault();
    document.execCommand('insertText', false, '\t');
    this.actualizarCuerpoDesdeEditor();
  }

  seleccionarImagen(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (archivo) this.insertarArchivoImagen(archivo);
    (evento.target as HTMLInputElement).value = '';
  }

  private insertarArchivoImagen(archivo: File): void {
    if (archivo.size > 5_000_000) {
      this.notifications.error('La imagen no puede superar los 5 MB.');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      document.execCommand('insertImage', false, lector.result as string);
      this.actualizarCuerpoDesdeEditor();
    };
    lector.readAsDataURL(archivo);
  }

  private actualizarCuerpoDesdeEditor(): void {
    if (this.editor) {
      this.formulario.controls.cuerpo.setValue(this.editor.nativeElement.innerHTML);
      this.formulario.controls.cuerpo.markAsTouched();
    }
  }

  generar(): void {
    this.actualizarCuerpoDesdeEditor();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.formulario.getRawValue() as CartaRequest);
  }
}
