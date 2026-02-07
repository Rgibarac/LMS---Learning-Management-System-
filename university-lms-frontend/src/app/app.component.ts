// src/app/app.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider'; // Added for safety
import { ApiService } from './core/services/api.service';
import { User } from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule  // Ensure divider works
  ],
  template: `
    <mat-sidenav-container class="lms-container" autosize>
      <mat-sidenav #sidenav mode="side" [opened]="sidebarOpen" class="lms-sidebar">
        <div class="sidebar-header">
          <mat-icon class="logo-icon">school</mat-icon>
          <span class="logo-text"></span>
        </div>

        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/" 
             [class.active]="isActive('/')" 
             routerLinkActive="active">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
          </a>

          <a mat-list-item routerLink="/courses" routerLinkActive="active">
            <mat-icon matListItemIcon>menu_book</mat-icon>
            <span matListItemTitle>Courses</span>
          </a>

          <a mat-list-item routerLink="/study-programs" routerLinkActive="active">
            <mat-icon matListItemIcon>school</mat-icon>
            <span matListItemTitle>Study Programs</span>
          </a>

          <!-- NEW: Colleges Link -->
          <a mat-list-item routerLink="/faculties" routerLinkActive="active">
            <mat-icon matListItemIcon>apartment</mat-icon>
            <span matListItemTitle>Colleges</span>
          </a>

          <a mat-list-item routerLink="/syllabuses" routerLinkActive="active">
            <mat-icon matListItemIcon>description</mat-icon>
            <span matListItemTitle>Syllabuses</span>
          </a>

          <a mat-list-item routerLink="/about" routerLinkActive="active">
            <mat-icon matListItemIcon>info</mat-icon>
            <span matListItemTitle>About University</span>
          </a>

          <mat-divider class="divider"></mat-divider>

          <a mat-list-item *ngIf="currentUser" [routerLink]="dashboardRoute" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>My Dashboard</span>
          </a>

          <a mat-list-item *ngIf="!currentUser" routerLink="/login">
            <mat-icon matListItemIcon>login</mat-icon>
            <span matListItemTitle>Login</span>
          </a>

          <a mat-list-item *ngIf="!currentUser" routerLink="/register">
            <mat-icon matListItemIcon>person_add</mat-icon>
            <span matListItemTitle>Register</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="lms-toolbar">
          <button mat-icon-button (click)="toggleSidebar()" class="menu-toggle">
            <mat-icon>{{ sidebarOpen ? 'menu_open' : 'menu' }}</mat-icon>
          </button>

          <span class="toolbar-title"></span>

          <span class="spacer"></span>

          <div class="user-section" *ngIf="currentUser">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <div class="avatar">{{ userInitials }}</div>
              <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
              <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item [routerLink]="dashboardRoute">
                <mat-icon>dashboard</mat-icon> Go to Dashboard
              </button>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> Profile
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </div>

          <div class="guest-buttons" *ngIf="!currentUser">
            <button mat-stroked-button routerLink="/login" class="mr-2">Login</button>
            <button mat-raised-button color="accent" routerLink="/register">Register</button>
          </div>
        </mat-toolbar>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .lms-container { height: 100%; background: #f8f9fc; }

    .lms-sidebar {
      width: 280px;
      background: linear-gradient(180deg, #5e35b1 0%, #7b1fa2 100%);
      color: white;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
    }

    .sidebar-header {
      padding: 28px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }

    .logo-icon { font-size: 48px; width: 48px; height: 48px; }
    .logo-text { font-size: 32px; font-weight: 700; margin-left: 12px; letter-spacing: 1px; }

    .nav-list a {
      color: white !important;
      border-radius: 0 30px 30px 0;
      margin: 6px 16px;
      transition: all 0.3s ease;
    }

    .nav-list a:hover { background: rgba(255,255,255,0.15) !important; transform: translateX(8px); }

    .nav-list a.active {
      background: rgba(255,255,255,0.25) !important;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .nav-list a.active mat-icon { color: #ffd700 !important; }

    .divider { background: rgba(255,255,255,0.2) !important; margin: 16px 0; }

    .lms-toolbar {
      height: 70px !important;
      padding: 0 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      z-index: 1000;
    }

    .menu-toggle { margin-right: 16px; }
    .toolbar-title { font-size: 21px; font-weight: 500; letter-spacing: 0.5px; }
    .spacer { flex: 1 1 auto; }

    .user-menu-btn {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 12px !important; border-radius: 30px;
      transition: all 0.3s;
    }

    .user-menu-btn:hover { background: rgba(255,255,255,0.15) !important; }

    .avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: white; color: #5e35b1; font-weight: bold;
      font-size: 15px; display: flex; align-items: center; justify-content: center;
    }

    .user-name { font-weight: 500; font-size: 15px; }
    .dropdown-icon { margin-left: 4px; }

    .guest-buttons button { margin-left: 12px; }
    .mr-2 { margin-right: 12px; }

    .page-content {
      padding: 24px;
      min-height: calc(100vh - 70px);
      background: #f8f9fc;
    }

    @media (max-width: 960px) {
      .toolbar-title { display: none; }
      .lms-sidebar { width: 80px; }
      .logo-text, .nav-list span { display: none; }
      .nav-list a { justify-content: center; }
    }

    @media (max-width: 600px) {
      .user-name { display: none; }
      .lms-toolbar { padding: 0 12px; }
    }
  `]
})
export class AppComponent implements OnInit {
  isBrowser = false;
  currentUser: User | null = null;
  sidebarOpen = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.updateUser();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateUser();
      }
    });
  }

  updateUser(): void {
    this.currentUser = this.apiService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get dashboardRoute(): string {
    const role = this.currentUser?.role?.toLowerCase();
    return role ? `/${role}` : '/';
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName?.[0] ?? ''}${this.currentUser.lastName?.[0] ?? ''}`.toUpperCase();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  logout(): void {
    this.apiService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}