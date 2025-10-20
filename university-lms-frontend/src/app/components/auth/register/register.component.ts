import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2>Register</h2>
    <form (ngSubmit)="register()">
      <mat-form-field>
        <label>Username</label>
        <input matInput [(ngModel)]="user.username" name="username" required>
      </mat-form-field>
      <mat-form-field>
        <label>Password</label>
        <input matInput type="password" [(ngModel)]="user.password" name="password" required>
      </mat-form-field>
      <mat-form-field>
        <label>Email</label>
        <input matInput [(ngModel)]="user.email" name="email" required>
      </mat-form-field>
      <mat-form-field>
        <label>First Name</label>
        <input matInput [(ngModel)]="user.firstName" name="firstName" required>
      </mat-form-field>
      <mat-form-field>
        <label>Last Name</label>
        <input matInput [(ngModel)]="user.lastName" name="lastName" required>
      </mat-form-field>
      <mat-form-field>
        <label>Index Number</label>
        <input matInput [(ngModel)]="user.indexNumber" name="indexNumber" required>
      </mat-form-field>
      <mat-form-field>
        <label>Role</label>
        <input matInput [(ngModel)]="user.role" name="role" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Register</button>
    </form>
  `
})
export class RegisterComponent {
  user: User = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    indexNumber: '',
    role: ''
  };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  register(): void {
    this.apiService.register(this.user).subscribe({
      next: () => {
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.snackBar.open('Registration failed: ' + error.message, 'Close', { duration: 3000 });
      }
    });
  }
}