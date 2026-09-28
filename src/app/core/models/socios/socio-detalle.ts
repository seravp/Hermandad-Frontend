import { EstadoSocio } from '../estados/estado-socio';
import { FormaPago } from '../../../features/socios/models/forma-pago';
import { TipoSocio } from './tipo-socio';

export interface SocioDetalle {
  id: number;

  numeroSocio: number;

  nombre: string;

  apellidos: string;

  dni: string;

  telefono: string;

  email: string;

  direccion: string;

  fechaNacimiento: string;

  estado: EstadoSocio;

  tipo: TipoSocio;

  cuadrilla: string | null;

  posicionCuadrilla: number | null;

  formaPago: FormaPago;

  iban: string | null;

  titularCuenta: string | null;
}
