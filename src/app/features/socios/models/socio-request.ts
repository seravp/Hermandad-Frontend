import { EstadoSocio } from '../../../core/models/estados/estado-socio';
import { FormaPago } from './forma-pago';
import { TipoSocio } from '../../../core/models/socios/tipo-socio';

export interface SocioRequest {
  nombre: string;

  apellidos: string;

  dni: string;

  telefono: string | null;

  email: string | null;

  direccion: string | null;

  fechaNacimiento: string | null;

  estado: EstadoSocio;

  tipo: TipoSocio;

  iban: string | null;

  titularCuenta: string | null;

  formaPago: FormaPago;
}
