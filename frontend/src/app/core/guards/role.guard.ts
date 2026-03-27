import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUser();
  const expectedRole = route.data['role'];

  if (user && user.role === expectedRole && user.active) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
