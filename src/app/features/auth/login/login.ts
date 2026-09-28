import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  username = '';

  password = '';

  mostrarPassword = false;

  error = '';

  private authService = inject(AuthService);

  private router = inject(Router);

  login(): void {
    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.authService.guardarSesion(response);

          this.router.navigate(['/dashboard']);
        },

        error: () => {
          this.error = 'Usuario o contraseña incorrectos';
        },
      });
  }
}
