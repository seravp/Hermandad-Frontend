export interface ConfiguracionCuadrilla {
  nombre: string;
  filas: number;
  columnas: number;
}

export interface Configuracion {
  nombreHermandad: string;

  cif: string;

  direccion: string;

  telefono: string;

  email: string;

  importeCuotaHermano: number;

  importeCuotaCostalero: number;

  anioActivo: number;

  iban: string;

  cuadrillas: ConfiguracionCuadrilla[];
}

export interface ConfiguracionCuotas {
  anioActivo: number;
  importeCuotaHermano: number;
  importeCuotaCostalero: number;
}
