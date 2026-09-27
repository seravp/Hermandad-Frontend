import { RolUsuario } from './usuario';

export interface UsuarioRequest {
  username: string;
  password?: string;
  rol: RolUsuario;
  activo: boolean;
}
