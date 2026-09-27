export interface Auditoria {
  id: number;
  usuario: string;
  accion: string;
  entidad: string;
  registroId: number | null;
  fecha: string;
}
