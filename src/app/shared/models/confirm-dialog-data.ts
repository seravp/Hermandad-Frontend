export interface ConfirmDialogData {
  titulo: string;

  mensaje: string;

  advertencia?: string;

  textoConfirmar?: string;

  textoCancelar?: string;

  icono?: string;

  color?: 'primary' | 'accent' | 'warn';
}
