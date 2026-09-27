import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Usuario, RolUsuario } from '../../../core/models/usuarios/usuario';
import { UsuarioService } from '../../../core/services/usuario';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationService } from '../../../shared/services/notification';
import { FormularioUsuarioComponent } from '../formulario/formulario';

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class ListadoUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  readonly roles: RolUsuario[] = ['ADMIN', 'TESORERO', 'SECRETARIO', 'CONSULTA'];

  readonly displayedColumns = ['username', 'rol', 'estado', 'acciones'];

  readonly busquedaControl = new FormControl('');

  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>();

  rolSeleccionado = '';
  estadoSeleccionado = '';

  ngOnInit(): void {
    this.cargarUsuarios();

    this.busquedaControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.aplicarFiltros());
  }

  nuevoUsuario(): void {
    const dialogRef = this.dialog.open(FormularioUsuarioComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((guardado) => {
      if (guardado) {
        this.cargarUsuarios();
      }
    });
  }

  editar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(FormularioUsuarioComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      data: usuario,
    });

    dialogRef.afterClosed().subscribe((guardado) => {
      if (guardado) {
        this.cargarUsuarios();
      }
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const activar = !usuario.activo;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        titulo: activar ? 'Activar usuario' : 'Desactivar usuario',
        mensaje: `¿Deseas ${activar ? 'activar' : 'desactivar'} al usuario
          <strong>${usuario.username}</strong>?`,
        advertencia: activar ? '' : 'No podrá iniciar sesión mientras esté desactivado.',
        textoConfirmar: activar ? 'Activar' : 'Desactivar',
        textoCancelar: 'Cancelar',
        icono: activar ? 'person_check' : 'person_off',
        color: activar ? 'primary' : 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.usuarioService
        .actualizar(usuario.id, {
          username: usuario.username,
          rol: usuario.rol,
          activo: activar,
        })
        .subscribe({
          next: () => {
            this.notificationService.success(
              activar ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
            );

            this.cargarUsuarios();
          },
          error: (error) => this.notificationService.httpError(error),
        });
    });
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  obtenerClaseEstado(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Desactivado';
  }

  private cargarUsuarios(): void {
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.aplicarFiltros();
      },
      error: (error) => this.notificationService.httpError(error),
    });
  }

  private aplicarFiltros(): void {
    const texto = (this.busquedaControl.value ?? '').toLowerCase().trim();

    this.dataSource.data = this.usuarios.filter((usuario) => {
      const coincideTexto = usuario.username.toLowerCase().includes(texto);

      const coincideRol = !this.rolSeleccionado || usuario.rol === this.rolSeleccionado;

      const coincideEstado =
        !this.estadoSeleccionado || String(usuario.activo) === this.estadoSeleccionado;

      return coincideTexto && coincideRol && coincideEstado;
    });
  }
}
