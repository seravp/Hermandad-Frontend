import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventarioService } from '../../../core/services/inventario';
import { RevisionInventario, RevisionInventarioDetalle } from '../../../core/models/inventario/revision-inventario';
import { NotificationService } from '../../../shared/services/notification';
import { AuthService } from '../../../core/services/auth';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({selector:'app-revisiones-inventario',standalone:true,imports:[CommonModule,FormsModule,MatButtonModule,MatCardModule,MatDialogModule,MatIconModule,MatInputModule,MatTableModule,MatTooltipModule],templateUrl:'./revisiones.html',styleUrl:'./revisiones.css'})
export class RevisionesInventarioComponent implements OnInit {
  private readonly service=inject(InventarioService); private readonly notifications=inject(NotificationService); private readonly dialog=inject(MatDialog); readonly auth=inject(AuthService);
  private readonly cdr=inject(ChangeDetectorRef);
  revisiones:RevisionInventario[]=[]; detalles:RevisionInventarioDetalle[]=[]; seleccionada?:RevisionInventario; columnas=['codigo','nombre','ubicacion','estado','verificado','incidencia','guardar']; columnasRevisiones=['fecha','titulo','estadoRevision','progreso','acciones'];
  ngOnInit():void{this.cargar();}
  cargar():void{this.service.revisiones().subscribe({next:r=>{this.revisiones=r;this.cdr.detectChanges();},error:e=>this.notifications.httpError(e)});}
  abrir(revision:RevisionInventario):void{this.seleccionada=revision;this.cargarDetalles();}
  crear():void{const titulo=window.prompt('Título de la revisión:');if(!titulo?.trim())return;this.service.crearRevision(titulo.trim()).subscribe({next:r=>{this.notifications.success('Revisión creada.');this.cargar();this.abrir(r);},error:e=>this.notifications.httpError(e)});}
  verificar(detalle:RevisionInventarioDetalle):void{const anterior=detalle.verificado;detalle.verificado=!anterior;this.cdr.detectChanges();this.service.actualizarDetalle(detalle.id,{verificado:detalle.verificado,estadoObservado:detalle.estadoObservado,ubicacionObservada:detalle.ubicacionObservada,incidencia:detalle.incidencia}).subscribe({next:()=>{this.cargarDetalles();this.cargar();},error:e=>{detalle.verificado=anterior;this.cdr.detectChanges();this.notifications.httpError(e);}});}
  guardarDetalle(detalle:RevisionInventarioDetalle):void{this.service.actualizarDetalle(detalle.id,{verificado:detalle.verificado,estadoObservado:detalle.estadoObservado,ubicacionObservada:detalle.ubicacionObservada,incidencia:detalle.incidencia}).subscribe({next:d=>{Object.assign(detalle,d);this.notifications.success('Comprobación guardada.');},error:e=>this.notifications.httpError(e)});}
  trackByDetalle(_: number, detalle: RevisionInventarioDetalle): number { return detalle.id; }
  private cargarDetalles(): void { if (!this.seleccionada) return; this.service.detallesRevision(this.seleccionada.id).subscribe({next:d=>{this.detalles=[...d];this.cdr.detectChanges();},error:e=>this.notifications.httpError(e)}); }
  cerrar():void{if(!this.seleccionada)return;const pendientes=this.detalles.filter(d=>!d.verificado).length;this.dialog.open(ConfirmDialogComponent,{width:'420px',disableClose:true,data:{titulo:'Cerrar revisión',mensaje:`¿Deseas cerrar la revisión <strong>${this.seleccionada.titulo}</strong>?`,advertencia:pendientes?`Quedan ${pendientes} bienes sin verificar. No podrá modificarse después.`:'No podrá modificarse después de cerrarla.',textoConfirmar:'Cerrar revisión',textoCancelar:'Cancelar',icono:'lock',color:'warn'}}).afterClosed().subscribe(confirmado=>{if(!confirmado||!this.seleccionada)return;this.service.cerrarRevision(this.seleccionada.id).subscribe({next:r=>{this.seleccionada=r;this.notifications.success('Revisión cerrada.');this.cargar();this.cdr.detectChanges();},error:e=>this.notifications.httpError(e)});});}
  eliminar(revision: RevisionInventario): void { this.dialog.open(ConfirmDialogComponent,{width:'420px',disableClose:true,data:{titulo:'Eliminar revisión',mensaje:`¿Deseas eliminar la revisión <strong>${revision.titulo}</strong>?`,advertencia:'Esta acción eliminará también todas sus comprobaciones y no se puede deshacer.',textoConfirmar:'Eliminar',textoCancelar:'Cancelar',icono:'delete',color:'warn'}}).afterClosed().subscribe(ok=>{if(!ok)return;this.service.eliminarRevision(revision.id).subscribe({next:()=>{this.notifications.success('Revisión eliminada.');if(this.seleccionada?.id===revision.id){this.seleccionada=undefined;this.detalles=[];}this.cargar();},error:e=>this.notifications.httpError(e)});});}
  puedeGestionar():boolean{return this.auth.puedeGestionarRevisionesInventario();}
}
