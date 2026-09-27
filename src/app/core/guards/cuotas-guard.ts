import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const cuotasGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.puedeConsultarCuotas()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
