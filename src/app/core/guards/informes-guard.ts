import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const informesGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.puedeGenerarInformes()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
