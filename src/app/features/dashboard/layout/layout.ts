import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';


import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class LayoutComponent implements AfterViewInit {
  readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  esMovil = false;
  menuAbierto = true;
  @ViewChild('menuLateral') private menuLateral?: MatSidenav;

  ngAfterViewInit(): void {
    this.breakpointObserver.observe('(max-width: 800px)').subscribe(resultado => {
      this.esMovil = resultado.matches;
      this.menuAbierto = !this.esMovil;

      if (!this.esMovil) {
        void this.menuLateral?.open();
      }
    });
  }

  readonly fechaActual = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  private router = inject(Router);

  esRutaActiva(ruta: string): boolean {
    return this.router.url === ruta;
  }

  cerrarMenuMovil(): void {
    if (this.esMovil) this.menuAbierto = false;
  }

  get nombreUsuario(): string {
    return this.authService.obtenerNombreUsuario();
  }

  get inicialesUsuario(): string {
    return this.nombreUsuario.slice(0, 2).toUpperCase();
  }

  get rolUsuario(): string {
    const etiquetas: Record<string, string> = {
      ADMIN: 'Administrador',
      TESORERO: 'Tesorero',
      SECRETARIO: 'Secretario',
      CONSULTA: 'Consulta',
    };

    return etiquetas[this.authService.obtenerRol() ?? ''] ?? 'Usuario';
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
