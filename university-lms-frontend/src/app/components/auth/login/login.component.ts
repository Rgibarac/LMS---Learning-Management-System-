import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>login</mat-icon>
          </div>
          <mat-card-title>Welcome Back!</mat-card-title>
          <mat-card-subtitle>Log in to your University LMS account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="login()" #loginForm="ngForm" class="login-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                [(ngModel)]="credentials.username"
                name="username"
                required
                autocomplete="username"
                #username="ngModel"
              >
              <mat-icon matSuffix>account_circle</mat-icon>
              <mat-error *ngIf="username.invalid && username.touched">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="credentials.password"
                name="password"
                required
                autocomplete="current-password"
                #password="ngModel"
              >
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="password.invalid && password.touched">
                Password is required
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid || isLoading"
            >
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Sign In</span>
              <span *ngIf="isLoading">Signing in...</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="start">
          <p class="register-link">
            Don't have an account?
            <a routerLink="/register" class="link">Register here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-card {
      max-width: 420px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35) !important;
      overflow: hidden;
    }

    .header-icon {
      background: #667eea;
      color: white;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin-top: 12px;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 16px;
      margin-top: 8px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 32px 0 24px;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      height: 54px;
      font-size: 17px;
      font-weight: 500;
      border-radius: 12px;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .register-link {
      margin: 0;
      color: #555;
      font-size: 15px;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      margin-left: 6px;
    }

    .link:hover {
      text-decoration: underline;
    }

    mat-card-actions {
      padding: 16px 24px 24px;
    }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  isLoading = false;

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  login(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.snack.open('Please enter username and password', 'Close', { duration: 4000 });
      return;
    }

    this.isLoading = true;

    this.api.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.snack.open('Welcome back!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        const user = this.api.getCurrentUser();
        const role = user?.role;

        switch (role) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'TEACHER':
            this.router.navigate(['/teacher']);
            break;
          case 'STAFF':
            this.router.navigate(['/staff']);
            break;
          case 'STUDENT':
            this.router.navigate(['/student']);
            break;
          default:
            this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.status === 401
          ? 'Invalid username or password'
          : 'Login failed. Please try again later.';
        this.snack.open(message, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}