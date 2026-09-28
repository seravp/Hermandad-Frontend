import { EstadoCuota } from '../estados/estado-cuota';
import { TipoSocio } from '../socios/tipo-socio';

export interface Cuota {
  id: number;

  anio: number;

  importe: number;

  estado: EstadoCuota;

  fechaPago: Date | null;

  observaciones: string | null;

  socioId: number;

  numeroSocio: number;

  nombreSocio: string;

  tipo: TipoSocio;

  cuadrilla: string | null;
}
