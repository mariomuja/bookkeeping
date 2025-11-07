import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuardSimple: CanActivateFn = () => {
  const router = inject(Router);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  if (token) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

