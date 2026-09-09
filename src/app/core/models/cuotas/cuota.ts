import { EstadoCuota } from '../estados/estado-cuota';

export interface Cuota {
  id: number;

  anio: number;

  importe: number;

  estado: EstadoCuota;

  fechaPago: Date | null;

  observaciones: string | null;

  hermanoId: number;

  numeroHermano: number;

  nombreHermano: string;
}
