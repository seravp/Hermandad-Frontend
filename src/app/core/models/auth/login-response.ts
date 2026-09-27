import type { RolUsuario } from '../usuarios/usuario';

export interface LoginResponse {
  token: string;
  rol: RolUsuario;
}
