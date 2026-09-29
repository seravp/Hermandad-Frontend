import type { RolUsuario } from '../usuarios/usuario';

export interface LoginResponse {
  username: string;
  token: string;
  rol: RolUsuario;
}
