export interface ConfirmDialogData {
  titulo: string;

  mensaje: string;

  advertencia?: string;

  icono?: string;

  color?: 'primary' | 'accent' | 'warn';

  colorIcono?: 'primary' | 'accent' | 'warn';

  textoConfirmar?: string;

  textoCancelar?: string;
}
