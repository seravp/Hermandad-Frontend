import { EstadoHermano } from '../../features/hermanos/models/estado-hermano';
import { FormaPago } from '../../features/hermanos/models/forma-pago';

export interface HermanoDetalle {
  id: number;

  numeroHermano: number;

  nombre: string;

  apellidos: string;

  dni: string;

  telefono: string;

  email: string;

  direccion: string;

  fechaNacimiento: string;

  estado: EstadoHermano;

  formaPago: FormaPago;

  iban: string | null;

  titularCuenta: string | null;
}
