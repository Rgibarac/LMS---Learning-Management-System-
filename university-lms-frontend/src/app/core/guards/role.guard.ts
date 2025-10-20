import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRole = route.data['role'] as string;
    console.log(`RoleGuard: Checking access for role ${requiredRole} on route ${route.url}`);
    const user = this.authService.getCurrentUser();
    if (user && user.role === requiredRole) {
      console.log(`RoleGuard: Access granted for ${user.role}`);
      return of(true);
    }
    console.log('RoleGuard: Access denied, redirecting to login');
    this.router.navigate(['/login']);
    return of(false);
  }
}