import { Component, inject } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
  ],
})
export class LayoutComponent {
  readonly authService = inject(AuthService);

  private router = inject(Router);

  esRutaActiva(ruta: string): boolean {
    return this.router.url === ruta;
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
