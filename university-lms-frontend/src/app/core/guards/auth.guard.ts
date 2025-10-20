import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);
  const expectedRole = route.url[0]?.path.toUpperCase();

  if (!apiService.isAuthenticated()) {
    console.log('AuthGuard: User not authenticated, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  const user = apiService.getCurrentUser();
  if (route.url[0]?.path === 'profile') {
    console.log(`AuthGuard: Access granted to profile for user: ${user?.username}`);
    return true;
  }

  if (user && user.role === expectedRole) {
    console.log(`AuthGuard: Access granted to ${expectedRole} dashboard for user: ${user?.username}`);
    return true;
  }

  console.log(`AuthGuard: Access denied to ${expectedRole} dashboard for user role: ${user?.role}`);
  router.navigate(['/login']);
  return false;
};