import { Injectable } from '@angular/core';
import { Router, CanActivate, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardSimple implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(): boolean | UrlTree {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      return true;
    }
    
    return this.router.createUrlTree(['/login']);
  }
}
