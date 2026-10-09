import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class SpanishDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value === 'string') {
      const coincidencia = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
      if (coincidencia) {
        const dia = Number(coincidencia[1]);
        const mes = Number(coincidencia[2]);
        const anio = Number(coincidencia[3]);
        const fecha = new Date(anio, mes - 1, dia);

        return fecha.getFullYear() === anio
          && fecha.getMonth() === mes - 1
          && fecha.getDate() === dia
          ? fecha
          : null;
      }
    }

    return super.parse(value);
  }
}
