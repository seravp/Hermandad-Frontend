export type RolUsuario = 'ADMIN' | 'TESORERO' | 'SECRETARIO' | 'CONSULTA';

export interface Usuario {
  id: number;
  username: string;
  rol: RolUsuario;
  activo: boolean;
}
