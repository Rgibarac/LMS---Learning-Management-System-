import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './core/services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  template: `
    <mat-toolbar color="primary">
      <span>University LMS</span>
      <span *ngIf="isBrowser && apiService.isAuthenticated()" class="welcome-message">
        Welcome, {{ apiService.getCurrentUser()?.username || 'User' }}
      </span>
      <div *ngIf="isBrowser" class="nav-links">
        <button mat-button [routerLink]="['/']" (click)="navigateTo('home')">Home</button>
        <button mat-button [routerLink]="['/faculties']" (click)="navigateTo('faculties')">Faculties</button>
        <button mat-button [routerLink]="['/study-programs']" (click)="navigateTo('study-programs')">Study Programs</button>
        <button mat-button [routerLink]="['/courses']" (click)="navigateTo('courses')">Courses</button>
        <button mat-button [routerLink]="['/syllabuses']" (click)="navigateTo('syllabuses')">Syllabuses</button>
        <button mat-button *ngIf="!apiService.isAuthenticated()" [routerLink]="['/login']" (click)="navigateTo('login')">Login</button>
        <button mat-button *ngIf="!apiService.isAuthenticated()" [routerLink]="['/register']" (click)="navigateTo('register')">Register</button>
        <button mat-button *ngIf="apiService.isAuthenticated()" (click)="goToDashboard()">Profile</button>
        <button mat-button *ngIf="apiService.isAuthenticated()" (click)="logout()">Logout</button>
      </div>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .nav-links {
      margin-left: auto;
    }
    .nav-links button {
      margin-left: 10px;
    }
    .welcome-message {
      margin-left: 20px;
      font-weight: bold;
    }
  `]
})
export class AppComponent {
  isBrowser: boolean;

  constructor(
    public apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.router.events.subscribe(event => {
      console.log('Router event:', event);
    });
  }

  navigateTo(page: string): void {
    console.log(`Navigating to: ${page}`);
    this.router.navigate([page]).then(success => {
      console.log(`Navigation to ${page} ${success ? 'succeeded' : 'failed'}`);
    });
  }

  goToDashboard(): void {
    const user = this.apiService.getCurrentUser();
    if (user && user.role) {
      const role = user.role.toLowerCase();
      const dashboardRoute = `/${role}`;
      console.log(`Navigating to dashboard: ${dashboardRoute}`);
      this.router.navigate([dashboardRoute]).then(success => {
        console.log(`Navigation to ${dashboardRoute} ${success ? 'succeeded' : 'failed'}`);
      });
    } else {
      console.error('User or role not found, redirecting to login');
      this.router.navigate(['/login']).then(success => {
        console.log(`Navigation to login ${success ? 'succeeded' : 'failed'}`);
      });
    }
  }

  logout(): void {
    console.log('Logging out');
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}