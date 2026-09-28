import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const inventarioRevisionesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.puedeGestionarRevisionesInventario() ? true : inject(Router).createUrlTree(['/dashboard']);
};
