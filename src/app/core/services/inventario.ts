import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page';
import { ElementoInventario, ElementoInventarioRequest, EstadoInventario } from '../models/inventario/inventario';
import { RevisionInventario, RevisionInventarioDetalle } from '../models/inventario/revision-inventario';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario`;
  buscar(texto = '', categoria = '', estado?: EstadoInventario, page = 0, size = 20): Observable<Page<ElementoInventario>> {
    let params = new HttpParams().set('texto', texto).set('categoria', categoria).set('page', page).set('size', size);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Page<ElementoInventario>>(this.apiUrl, { params });
  }
  crear(request: ElementoInventarioRequest): Observable<ElementoInventario> { return this.http.post<ElementoInventario>(this.apiUrl, request); }
  actualizar(id: number, request: ElementoInventarioRequest): Observable<ElementoInventario> { return this.http.put<ElementoInventario>(`${this.apiUrl}/${id}`, request); }
  cambiarActivo(id: number, activo: boolean): Observable<ElementoInventario> { return this.http.put<ElementoInventario>(`${this.apiUrl}/${id}/activo`, null, { params: { activo } }); }
  subirImagen(id: number, archivo: File): Observable<ElementoInventario> { const datos = new FormData(); datos.append('archivo', archivo); return this.http.post<ElementoInventario>(`${this.apiUrl}/${id}/imagen`, datos); }
  obtenerImagen(nombre: string): Observable<Blob> { return this.http.get(`${this.apiUrl}/imagenes/${encodeURIComponent(nombre)}`, { responseType: 'blob' }); }
  revisiones(): Observable<RevisionInventario[]> { return this.http.get<RevisionInventario[]>(`${this.apiUrl}/revisiones`); }
  crearRevision(titulo: string, observaciones?: string): Observable<RevisionInventario> { return this.http.post<RevisionInventario>(`${this.apiUrl}/revisiones`, { titulo, observaciones }); }
  detallesRevision(id: number): Observable<RevisionInventarioDetalle[]> { return this.http.get<RevisionInventarioDetalle[]>(`${this.apiUrl}/revisiones/${id}/detalles`); }
  actualizarDetalle(id: number, datos: { verificado: boolean; estadoObservado?: EstadoInventario; ubicacionObservada?: string; incidencia?: string }): Observable<RevisionInventarioDetalle> { return this.http.put<RevisionInventarioDetalle>(`${this.apiUrl}/revisiones/detalles/${id}`, datos); }
  cerrarRevision(id: number): Observable<RevisionInventario> { return this.http.put<RevisionInventario>(`${this.apiUrl}/revisiones/${id}/cerrar`, null); }
  eliminarRevision(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/revisiones/${id}`); }
}
