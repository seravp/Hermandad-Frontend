import { EstadoCuota } from '../estados/estado-cuota';


export interface CuotaDetalle {
  id: number;

  anio: number;

  importe: number;

  estado: EstadoCuota;

  fechaPago: Date | null;

  observaciones: string | null;

  socioId: number;

  numeroSocio: number;

  nombreSocio: string;
}
