export type TipoMovimientoTesoreria = 'INGRESO' | 'GASTO';

export interface MovimientoTesoreria {
  id: number;
  fecha: string;
  concepto: string;
  categoria: string;
  tipo: TipoMovimientoTesoreria;
  importe: number;
  formaPago?: string;
  observaciones?: string;
  procedenteDeCuota: boolean;
}

export interface SerieMensualTesoreria { mes: string; ingresos: number; gastos: number; }
export interface CategoriaTesoreria { categoria: string; importe: number; }
export interface ResumenTesoreria {
  saldoActual: number;
  ingresos: number;
  gastos: number;
  cuotasCobradas: number;
  previsionCuotas: number;
  evolucionMensual: SerieMensualTesoreria[];
  distribucionIngresos: CategoriaTesoreria[];
}

export interface ComparativaTesoreria {
  anioBase: number;
  anioComparativo: number;
  base: ResumenTesoreria;
  comparativo: ResumenTesoreria;
}

export interface MovimientoTesoreriaRequest {
  fecha: string;
  concepto: string;
  categoria: string;
  tipo: TipoMovimientoTesoreria;
  importe: number;
  formaPago?: string;
  observaciones?: string;
}
