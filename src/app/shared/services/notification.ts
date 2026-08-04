import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private open(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }

  success(message: string): void {
    this.open(message, 'snackbar-success', 3000);
  }

  error(message: string): void {
    this.open(message, 'snackbar-error', 5000);
  }

  info(message: string): void {
    this.open(message, 'snackbar-info', 4000);
  }

  warning(message: string): void {
    this.open(message, 'snackbar-warning', 5000);
  }

  httpError(error: HttpErrorResponse): void {
    const backendError =
      typeof error.error === 'object' ? (error.error as ErrorResponse) : undefined;

    let message: string;



    switch (error.status) {
      case 400:
        if (backendError?.message) {
          message = backendError.message;
        } else if (typeof error.error === 'object') {
          message = Object.values(error.error).join('\n');
        } else {
          message = 'Solicitud incorrecta.';
        }

        break;

      case 401:
        message = backendError?.message ?? 'No estás autenticado.';
        break;

      case 403:
        message = backendError?.message ?? 'No tienes permisos para realizar esta acción.';
        break;

      case 404:
        message = backendError?.message ?? 'No se ha encontrado el recurso solicitado.';
        break;

      case 409:
        message = backendError?.message ?? 'Conflicto con los datos.';
        break;

      case 500:
        message = backendError?.message ?? 'Error interno del servidor.';
        break;

      case 0:
        message = 'No se ha podido conectar con el servidor.';
        break;

      default:
        message = backendError?.message ?? 'Ha ocurrido un error inesperado.';
        break;
    }

    this.error(message);
  }
}
