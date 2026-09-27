export type EstadoInventario = 'BUENO' | 'REGULAR' | 'DETERIORADO' | 'RESTAURACION' | 'EXTRAVIADO';

export interface ElementoInventario {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  ubicacion: string;
  estado: EstadoInventario;
  fechaAdquisicion?: string;
  valorAdquisicion?: number;
  activo: boolean;
  observaciones?: string;
  imagenUrl?: string;
}

export type ElementoInventarioRequest = Omit<ElementoInventario, 'id' | 'activo'>;
