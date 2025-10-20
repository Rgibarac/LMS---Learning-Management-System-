import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="login()">
      <mat-form-field>
        <label>Username</label>
        <input matInput [(ngModel)]="credentials.username" name="username" required>
      </mat-form-field>
      <mat-form-field>
        <label>Password</label>
        <input matInput type="password" [(ngModel)]="credentials.password" name="password" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  login(): void {
    this.apiService.login(this.credentials).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        window.location.reload();
      },
      error: (error: { message: string; }) => {
        console.error('Login error:', error);
        this.snackBar.open('Login failed: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }
}