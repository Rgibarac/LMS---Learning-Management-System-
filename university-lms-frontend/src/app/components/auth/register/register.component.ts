import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>school</mat-icon>
          </div>
          <mat-card-title>Create Student Account</mat-card-title>
          <mat-card-subtitle>Join the University LMS</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="register()" #registerForm="ngForm" class="register-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>First Name</mat-label>
              <input matInput [(ngModel)]="user.firstName" name="firstName" required autocomplete="given-name">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="user.lastName" name="lastName" required autocomplete="family-name">
              <mat-icon matSuffix>person_outline</mat-icon>
            </mat-form-field>


            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="user.email" name="email" required autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="user.username" name="username" required autocomplete="username">
              <mat-icon matSuffix>account_circle</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="user.password" name="password" required minlength="1" autocomplete="new-password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-hint align="end">{{user.password?.length || 0}}/6+</mat-hint>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="registerForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Register as Student</span>
              <span *ngIf="isLoading">Creating Account...</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="start">
          <p>Already have an account?
            <a routerLink="/login" class="login-link">Sign in here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .register-card {
      max-width: 480px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
    }

    .header-icon {
      background: #667eea;
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    mat-card-subtitle {
      color: #666;
      font-size: 16px;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      height: 50px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 10px;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    mat-card-actions p {
      margin: 0;
      color: #555;
      font-size: 14px;
    }
  `]
})
export class RegisterComponent {
  isLoading = false;

  user = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    indexNumber: 'NULL' as const,
    role: 'UNASSIGNED' as const  
  };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  register(): void {
    if (!this.user.username || !this.user.password || !this.user.email ||
        !this.user.firstName || !this.user.lastName) {
      return;
    }

    this.isLoading = true;

    this.apiService.register(this.user).subscribe({
      next: () => {
        this.snackBar.open('Registration successful! Please log in.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.isLoading = false;
        const msg = error.error?.message || 'Registration failed. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}