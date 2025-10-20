import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../services/api.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const platformId = inject(PLATFORM_ID);
  const apiService = inject(ApiService);
  console.log(`Interceptor: Processing request to ${req.url}`);
  if (
    req.url.includes('/api/public/') ||
    req.url.includes('/api/users/register') ||
    req.url.includes('/api/login') ||
    req.url.includes('/api/admin/export/users') ||
    req.url.includes('/api/courses') ||
    req.url.includes('/api/study-programs') ||
    req.url.includes('/api/admin/') ||
    req.url.includes('/api/syllabuses') ||
    req.url.includes('/api/student-teacher')
  ) {
    console.log(`Interceptor: Skipping auth for ${req.url}`);
    return next(req);
  }

  if (isPlatformBrowser(platformId)) {
    const credentials = apiService.getCredentials();
    if (credentials) {
      const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
      console.log(`Interceptor: Adding Basic Auth to ${req.url}`);
      const cloned = req.clone({
        headers: req.headers.set('Authorization', authHeader)
      });
      return next(cloned);
    } else {
      console.log(`Interceptor: No credentials for ${req.url}`);
    }
  }
  return next(req);
}