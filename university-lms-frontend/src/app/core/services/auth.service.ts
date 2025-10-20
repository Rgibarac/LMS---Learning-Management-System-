import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private user: User | null = null;
  private credentials: { username: string; password: string } | null = null;

  constructor(private http: HttpClient) {
    const userData = localStorage.getItem('user');
    const credentialsData = localStorage.getItem('credentials');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    if (credentialsData) {
      this.credentials = JSON.parse(credentialsData);
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.user) {
          this.user = response.user;
          this.credentials = credentials;
          localStorage.setItem('user', JSON.stringify(this.user));
          localStorage.setItem('credentials', JSON.stringify(this.credentials));
          console.log('User and credentials saved:', this.user, this.credentials);
        } else {
          console.error('Login response missing user:', response);
        }
      })
    );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, user);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/update`, user).pipe(
      tap((updatedUser: User) => {
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('User profile updated:', updatedUser);
      })
    );
  }

  exportUsersPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/export/users?format=pdf`, {
      responseType: 'blob'
    });
  }

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getCredentials(): { username: string; password: string } | null {
    return this.credentials;
  }

  logout(): void {
    this.user = null;
    this.credentials = null;
    localStorage.removeItem('user');
    localStorage.removeItem('credentials');
    console.log('User logged out');
  }
}