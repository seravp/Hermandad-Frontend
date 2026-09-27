import { EstadoInventario } from './inventario';

export interface RevisionInventario {
  id: number; titulo: string; fecha: string; usuario: string;
  estado: 'ABIERTA' | 'CERRADA'; observaciones?: string;
  totalElementos: number; verificados: number; incidencias: number;
}

export interface RevisionInventarioDetalle {
  id: number; elementoId: number; codigo: string; nombre: string; categoria: string;
  ubicacionRegistrada: string; estadoRegistrado: EstadoInventario; verificado: boolean;
  estadoObservado?: EstadoInventario; ubicacionObservada?: string; incidencia?: string;
  fechaVerificacion?: string;
}
