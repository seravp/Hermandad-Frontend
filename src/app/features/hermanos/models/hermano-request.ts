import { EstadoHermano } from './estado-hermano';
import { FormaPago } from './forma-pago';

export interface HermanoRequest {
  nombre: string;

  apellidos: string;

  dni: string;

  telefono: string | null;

  email: string | null;

  direccion: string | null;

  fechaNacimiento: string | null;

  estado: EstadoHermano;

  iban: string | null;

  titularCuenta: string | null;

  formaPago: FormaPago;
}
