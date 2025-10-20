import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    @if (user) {
      <h2>Profile</h2>
      <form (ngSubmit)="updateProfile()">
        <mat-form-field>
          <label>Email</label>
          <input matInput [(ngModel)]="user.email" name="email">
        </mat-form-field>
        <mat-form-field>
          <label>First Name</label>
          <input matInput [(ngModel)]="user.firstName" name="firstName">
        </mat-form-field>
        <mat-form-field>
          <label>Last Name</label>
          <input matInput [(ngModel)]="user.lastName" name="lastName">
        </mat-form-field>
        <mat-form-field>
          <label>Index Number</label>
          <input matInput [(ngModel)]="user.indexNumber" name="indexNumber">
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit">Update Profile</button>
      </form>
    }
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.apiService.getCurrentUser();
    if (this.user) {
      this.apiService.getProfile().subscribe({
        next: (user) => {
          this.user = user;
          this.apiService['user'] = user;
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Profile fetched:', user);
        },
        error: (error) => {
          console.error('Error fetching profile:', error);
          this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateProfile(): void {
    if (this.user) {
      this.apiService.updateProfile(this.user).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          const role = updatedUser.role.toLowerCase();
          this.router.navigate([`/${role}`]);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.snackBar.open('Update failed: ' + error.message, 'Close', { duration: 3000 });
        }
      });
    }
  }
}